<?php

declare(strict_types=1);

namespace Drupal\ekino_rendr\Plugin\views\filter;

use Drupal\Core\Config\Entity\ConfigEntityStorageInterface;
use Drupal\Core\Entity\Element\EntityAutocomplete;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\ekino_rendr\Entity\Channel;
use Drupal\views\Plugin\views\filter\ManyToOne;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Filter by Channel id.
 *
 * @ingroup views_filter_handlers
 *
 * @ViewsFilter("channels_target_id")
 */
class ChannelTargetId extends ManyToOne
{
    // Stores the exposed input for this filter.
    public $validated_exposed_input = null;

    /**
     * The Channel storage.
     *
     * @var ConfigEntityStorageInterface
     */
    protected $channelTypeStorage;

    /**
     * The Channel storage.
     *
     * @var EntityStorageInterface
     */
    protected $channelStorage;

    /**
     * @param array                        $configuration        A configuration array containing information about the plugin instance
     * @param string                       $plugin_id            The plugin_id for the plugin instance
     * @param mixed                        $plugin_definition    The plugin implementation definition
     * @param configEntityStorageInterface $channel_type_storage The channel type storage
     * @param entityStorageInterface       $channel_storage      The channel storage
     */
    public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigEntityStorageInterface $channel_type_storage, EntityStorageInterface $channel_storage)
    {
        parent::__construct($configuration, $plugin_id, $plugin_definition);
        $this->channelTypeStorage = $channel_type_storage;
        $this->channelStorage = $channel_storage;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition)
    {
        return new static(
            $configuration,
            $plugin_id,
            $plugin_definition,
            $container->get('entity_type.manager')->getStorage('ekino_rendr_channel_type'),
            $container->get('entity_type.manager')->getStorage('ekino_rendr_channel')
        );
    }

    public function hasExtraOptions()
    {
        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function getValueOptions()
    {
        return $this->valueOptions;
    }

    protected function defineOptions()
    {
        $options = parent::defineOptions();

        $options['channel_type'] = ['default' => ''];

        return $options;
    }

    public function buildExtraOptionsForm(&$form, FormStateInterface $form_state)
    {
        $channelTypes = $this->channelTypeStorage->loadMultiple();
        $options = [];
        foreach ($channelTypes as $channelType) {
            $options[$channelType->id()] = $channelType->label();
        }

        $form['channel_type'] = [
            '#type' => 'radios',
            '#title' => $this->t('Channel Type'),
            '#options' => $options,
            '#description' => $this->t('Select which channel Type to use.'),
            '#default_value' => 1,
        ];
    }

    protected function valueForm(&$form, FormStateInterface $form_state)
    {
        $channelType = $this->channelTypeStorage->load($this->options['channel_type']);
        if (empty($channelType)) {
            $form['markup'] = [
                '#markup' => '<div class="js-form-item form-item">'.$this->t('An invalid channel type is selected. Please change it in the options.').'</div>',
            ];

            return;
        }

        $channels = $this->value ? Channel::loadMultiple(($this->value)) : [];
        $form['value'] = [
            '#type' => 'entity_autocomplete',
            '#target_type' => 'ekino_rendr_channel',
            '#selection_settings' => ['target_bundles' => $channelType->id()],
            '#title' => $this->t('Select channel'),
            '#default_value' => EntityAutocomplete::getEntityLabels($channels),
            '#tags' => true,
            '#process_default_value' => false,
        ];

        if (!$form_state->get('exposed')) {
            // Retain the helper option
            $this->helper->buildOptionsForm($form, $form_state);

            // Show help text if not exposed to end users.
            $form['value']['#description'] = \t('Leave blank for all. Otherwise, the first selected channel will be the default instead of "Any".');
        }
    }

    protected function valueValidate($form, FormStateInterface $form_state)
    {
        $cids = [];
        if ($values = $form_state->getValue(['options', 'value'])) {
            foreach ($values as $value) {
                $cids[] = $value['target_id'];
            }
        }
        $form_state->setValue(['options', 'value'], $cids);
    }

    public function acceptExposedInput($input)
    {
        if (empty($this->options['exposed'])) {
            return true;
        }
        // We need to know the operator, which is normally set in
        // \Drupal\views\Plugin\views\filter\FilterPluginBase::acceptExposedInput(),
        // before we actually call the parent version of ourselves.
        if (!empty($this->options['expose']['use_operator']) && !empty($this->options['expose']['operator_id']) && isset($input[$this->options['expose']['operator_id']])) {
            $this->operator = $input[$this->options['expose']['operator_id']];
        }

        // If view is an attachment and is inheriting exposed filters, then assume
        // exposed input has already been validated
        if (!empty($this->view->is_attachment) && $this->view->display_handler->usesExposed()) {
            $this->validated_exposed_input = (array) $this->view->exposed_raw_input[$this->options['expose']['identifier']];
        }

        // If we're checking for EMPTY or NOT, we don't need any input, and we can
        // say that our input conditions are met by just having the right operator.
        if ('empty' == $this->operator || 'not empty' == $this->operator) {
            return true;
        }

        // If it's non-required and there's no value don't bother filtering.
        if (!$this->options['expose']['required'] && empty($this->validated_exposed_input)) {
            return false;
        }

        $rc = parent::acceptExposedInput($input);
        if ($rc) {
            // If we have previously validated input, override.
            if (isset($this->validated_exposed_input)) {
                $this->value = $this->validated_exposed_input;
            }
        }

        return $rc;
    }

    public function validateExposed(&$form, FormStateInterface $form_state)
    {
        if (empty($this->options['exposed'])) {
            return;
        }

        $identifier = $this->options['expose']['identifier'];

        if (empty($this->options['expose']['identifier'])) {
            return;
        }

        if ($values = $form_state->getValue($identifier)) {
            foreach ($values as $value) {
                $this->validated_exposed_input[] = $value['target_id'];
            }
        }
    }

    protected function valueSubmit($form, FormStateInterface $form_state)
    {
        // prevent array_filter from messing up our arrays in parent submit.
    }

    public function adminSummary()
    {
        // set up $this->valueOptions for the parent summary
        $this->valueOptions = [];

        if ($this->value) {
            $this->value = \array_filter($this->value);
            $channels = Channel::loadMultiple($this->value);
            foreach ($channels as $channel) {
                $this->valueOptions[$channel->id()] = \Drupal::service('entity.repository')->getTranslationFromContext($channel)->label();
            }
        }

        return parent::adminSummary();
    }

    /**
     * {@inheritdoc}
     */
    public function getCacheContexts()
    {
        $contexts = parent::getCacheContexts();
        // The result potentially depends on term access and so is just cacheable
        // per user.
        // @todo See https://www.drupal.org/node/2352175.
        $contexts[] = 'user';

        return $contexts;
    }

    /**
     * {@inheritdoc}
     */
    public function calculateDependencies()
    {
        $dependencies = parent::calculateDependencies();

        $channelType = $this->channelTypeStorage->load($this->options['channel_type']);
        $dependencies[$channelType->getConfigDependencyKey()][] = $channelType->getConfigDependencyName();

        foreach ($this->channelStorage->loadMultiple($this->options['value']) as $channel) {
            $dependencies[$channel->getConfigDependencyKey()][] = $channel->getConfigDependencyName();
        }

        return $dependencies;
    }
}
