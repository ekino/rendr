<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Form;

use Drupal\Core\Entity\EntityForm;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class TemplateForm extends EntityForm
{
    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container)
    {
        return new self();
    }

    /**
     * {@inheritdoc}
     */
    public function form(array $form, FormStateInterface $form_state)
    {
        $form = parent::form($form, $form_state);
        $pageTemplate = $this->entity;

        $form['label'] = [
            '#type' => 'textfield',
            '#title' => $this->t('Label'),
            '#maxlength' => 255,
            '#default_value' => $pageTemplate->label(),
            '#description' => $this->t("Name of the page template"),
            '#required' => TRUE,
        ];
        $form['id'] = [
            '#type' => 'machine_name',
            '#default_value' => $pageTemplate->id(),
            '#machine_name' => [
                'exists' => [$this, 'exist'],
            ],
            '#disabled' => !$pageTemplate->isNew(),
        ];

        $form['containers'] = [
            '#type' => 'textarea',
            '#title' => $this->t('Containers'),
            '#description' => $this->t("The possible values this field can contain. Enter one value per line, in the format key|label."),
            '#default_value' => implode("\n", array_map(static function (array $container) {
                return sprintf('%s | %s', $container['id'], $container['label']);
            },  $pageTemplate->get('containers') ?? [])),
            '#required' => TRUE,
        ];

        return $form;
    }

    /**
     * {@inheritdoc}
     */
    public function validateForm(array &$form, FormStateInterface $form_state)
    {
        $lines = explode("\n", $form_state->getValue('containers'));

        foreach ($lines as $i => $line) {
            if (!preg_match('/^[a-z1-9_]+\s*\|[^|]*$/', $line)) {
                $form_state->setErrorByName('containers', $this->t('Invalid format provided at line @line. 
The key must be all lowercase, no space, digits and underscore are allowed. ex: "header | Header"',
                    ['@line' => $i + 1]
                ));
                break;
            }
        }
    }

    /**
     * {@inheritdoc}
     */
    public function save(array $form, FormStateInterface $form_state) {
        $template = $this->entity;
        $lines = explode("\n", $form_state->getValue('containers'));
        $containers = array_map(static function ($line) {
            $parts = explode('|', $line);
            $container = [];
            $container['id'] = trim($parts[0]);
            $container['label'] = trim($parts[1]);

            return $container;
        }, $lines);
        $this->entity->set('containers', $containers);

        $status = $template->save();

        if ($status) {
            $this->messenger()->addMessage($this->t('Page Template %label was saved.', [
                '%label' => $template->label(),
            ]));
        }
        else {
            $this->messenger()->addMessage($this->t('The Template %label was not saved.', [
                '%label' => $template->label(),
            ]), MessengerInterface::TYPE_ERROR);
        }

        $form_state->setRedirect('entity.ekino_rendr_template.collection');
    }

    public function exist($id) {
        $entity = $this->entityTypeManager->getStorage('ekino_rendr_template')->getQuery()
            ->condition('id', $id)
            ->execute();
        return (bool) $entity;
    }
}
