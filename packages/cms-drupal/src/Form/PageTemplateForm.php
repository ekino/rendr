<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Form;

use Drupal\Core\Entity\ContentEntityConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\ekino_rendr\Converter\TemplateConverter;
use Drupal\ekino_rendr\Entity\PageInterface;
use Drupal\ekino_rendr\Entity\Template;

class PageTemplateForm extends ContentEntityConfirmFormBase
{
    /**
     * {@inheritdoc}
     */
    public function getQuestion()
    {
        /** @var PageInterface $entity */
        $entity = $this->getEntity();

        return $this->t(
            'Change page %label template',
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

        return $this->t('<p>Change from %original_template template to ?</p>', ['%original_template' => $entity->bundle()]);
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state)
    {
        /** @var PageInterface $entity */
        $entity = $this->getEntity();
        $templates = Template::loadMultiple();
        $templateOptions = [];

        foreach ($templates as $template) {
            if ($template->id() !== $entity->bundle()) {
                $templateOptions[$template->id()] = $template->label();
            }
        }

        $form = parent::buildForm($form, $form_state);

        $form['target_template'] = [
            '#title' => $this->t('New template'),
            '#type' => 'select',
            '#options' => $templateOptions,
        ];

        return $form;
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

        if (empty($form_state->getValue('target_template'))) {
            $this->messenger()->addStatus('No target template defined');

            return;
        }

        TemplateConverter::convertPageTemplate($entity, $entity->bundle(), $form_state->getValue('target_template'));
        $this->messenger()->addStatus('Change applied');
        // Reload the entity to ensure manager cache is cleared
        \Drupal::entityTypeManager()->getStorage('ekino_rendr_page')->loadUnchanged($entity->id());
        $form_state->setRedirectUrl($entity->toUrl('edit-form'));
    }
}
