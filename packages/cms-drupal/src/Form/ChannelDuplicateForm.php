<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Form;

use Drupal\Core\Entity\ContentEntityConfirmFormBase;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\ekino_rendr\Duplicator\ChannelDuplicatorInterface;
use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\ekino_rendr\Entity\PageInterface;

class ChannelDuplicateForm extends ContentEntityConfirmFormBase
{
    /**
     * @var ChannelDuplicatorInterface
     */
    protected $channelDuplicator;

    /**
     * ChannelDuplicateForm constructor.
     */
    public function __construct(ChannelDuplicatorInterface $channelDuplicator, EntityRepositoryInterface $entity_repository)
    {
        $this->channelDuplicator = $channelDuplicator;
        parent::__construct($entity_repository);
    }

    /**
     * {@inheritdoc}
     */
    public function getQuestion()
    {
        /** @var ChannelInterface $entity */
        $entity = $this->getEntity();

        return $this->t(
            'Duplicate channel %label',
            [
                '%label' => $entity->label(),
            ]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function getDescription()
    {
        /** @var ChannelInterface $entity */
        $entity = $this->getEntity();

        return $this->t(
            '<p>Duplicating this channel will generate the following changes:</p>'.$this->getDuplicationSummaryText(),
            \array_merge([
                '%label' => $entity->label(),
            ], $this->getDuplicationSummaryParameters($entity))
        );
    }

    /**
     * {@inheritdoc}
     */
    public function getCancelUrl()
    {
        $entity = $this->getEntity();

        if ($entity->hasLinkTemplate('collection')) {
            // If available, return the collection URL.
            return $entity->toUrl('collection');
        }

        // Otherwise fall back to the default link template.
        return $entity->toUrl();
    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        /** @var ChannelInterface $entity */
        $entity = $this->getEntity();
        $duplicate = $this->channelDuplicator->duplicate($entity);
        $this->messenger()->addStatus($this->getDuplicationMessage());
        $form_state->setRedirectUrl($duplicate->toUrl('edit-form'));
        $this->logDuplicationMessage();
    }

    /**
     * Gets the message to display to the user after duplicating the entity.
     *
     * @return string
     *                The translated string of the duplication message
     */
    protected function getDuplicationMessage()
    {
        $entity = $this->getEntity();

        return $this->t('The channel %label has been duplicated.', [
            '%label' => $entity->label(),
        ]);
    }

    /**
     * Logs a message about the duplicated entity.
     */
    protected function logDuplicationMessage()
    {
        /** @var ChannelInterface $entity */
        $entity = $this->getEntity();

        $this->logger($entity->getEntityType()->getProvider())->notice(
            "The channel %label has been duplicated.\n".$this->getDuplicationSummaryText(),
            \array_merge([
                '%label' => $entity->label(),
            ], $this->getDuplicationSummaryParameters($entity))
        );
    }

    protected function getDuplicationSummaryText()
    {
        return '<ul>
<li>%countUpdated layout pages duplicated<br/>%exampleUpdated</li>
<li>%countDuplicated children pages duplicated<br/>%exampleDuplicated</li>
</ul>';
    }

    protected function getDuplicationSummaryParameters(ChannelInterface $channel)
    {
        [$layoutPages, $childrenPages] = $this->channelDuplicator->getAffectedPages($channel);
        $exampleSummary = static function ($pages) {
            $titles = \array_map(static function (PageInterface $page) {
                return $page->getTitle();
            }, \array_slice($pages, 0, 2));

            if (\count($pages) > 2) {
                $titles[] = '...';
            }

            return \implode(', ', $titles);
        };

        return [
            '%countUpdated' => \count($layoutPages),
            '%exampleUpdated' => $exampleSummary($layoutPages),
            '%countDuplicated' => \count($childrenPages),
            '%exampleDuplicated' => $exampleSummary($childrenPages),
        ];
    }
}
