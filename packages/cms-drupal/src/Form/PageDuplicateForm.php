<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Form;

use Drupal\Core\Entity\ContentEntityConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\ekino_rendr\Entity\ChannelInterface;
use Drupal\ekino_rendr\Entity\PageInterface;

class PageDuplicateForm extends ContentEntityConfirmFormBase
{
    /**
     * {@inheritdoc}
     */
    public function getQuestion()
    {
        /** @var PageInterface $entity */
        $entity = $this->getEntity();

        return $this->t(
            'Duplicate page %label',
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
        /** @var PageInterface $entity */
        $entity = $this->getEntity();

        return $this->t('<p>Do you want to continue?</p>');
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
        /** @var PageInterface $entity */
        $entity = $this->getEntity();
        $duplicate = $entity->createDuplicate();
        $duplicate->set('title', $duplicate->getTitle().' - DUPLICATE');
        $duplicate->save();
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

        return $this->t('The page %label has been duplicated.', [
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
            'The page %label has been duplicated.',
            [
                '%label' => $entity->label(),
            ]
        );
    }
}
