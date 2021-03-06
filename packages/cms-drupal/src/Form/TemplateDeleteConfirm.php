<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Form;

use Drupal\Core\Entity\EntityDeleteForm;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a form for Template deletion.
 */
class TemplateDeleteConfirm extends EntityDeleteForm
{
    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state)
    {
        $num_pages = $this->entityTypeManager->getStorage('ekino_rendr_page')->getQuery()
            ->condition('template', $this->entity->id())
            ->count()
            ->execute();
        if ($num_pages) {
            $caption = '<p>'.$this->formatPlural(
                    $num_pages,
                    '%template Page Template is used by 1 piece of content on your site. You can not remove the %template Page Template until you have removed all from the content.',
                    '%template Page Template is used by @count pieces of content on your site. You may not remove %template Page Template until you have removed all from the content.',
                    ['%template' => $this->entity->label()]).'</p>';
            $form['#title'] = $this->getQuestion();
            $form['description'] = ['#markup' => $caption];

            // Optional to delete existing entities.
            $form['delete_entities'] = [
                '#type' => 'submit',
                '#submit' => [[$this, 'deleteExistingEntities']],
                '#value' => $this->formatPlural($num_pages, 'Delete existing Pages', 'Delete all @count existing Pages'),
            ];

            return $form;
        }

        return parent::buildForm($form, $form_state);
    }

    /**
     * Form submit callback to delete Templates.
     *
     * @param array                                $form
     *                                                         An associative array containing the structure of the form
     * @param \Drupal\Core\Form\FormStateInterface $form_state
     *                                                         The current state of the form
     */
    public function deleteExistingEntities(array $form, FormStateInterface $form_state)
    {
        $storage = $this->entityTypeManager->getStorage('ekino_rendr_page');
        $ids = $storage->getQuery()
            ->condition('template', $this->entity->id())
            ->execute();

        if (!empty($ids)) {
            $pages = $storage->loadMultiple($ids);

            // Delete existing entities.
            $storage->delete($pages);
            $this->messenger()->addMessage($this->formatPlural(\count($pages), 'Entity is successfully deleted.', 'All @count entities are successfully deleted.'));
        }

        // Set form to rebuild.
        $form_state->setRebuild();
    }
}
