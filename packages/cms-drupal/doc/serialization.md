# Exposing content in the API

## Serialization

Rendr page API in Drupal is based on the [Serialization](https://www.drupal.org/docs/8/api/serialization-api/serialization-api-overview) api.

It calls `Normalizer` services that support the format `rendr_json`.

## Paragraphs

This module includes a support for *Paragraphs* normalization. The workflow is as follow:
1. An entity that contains a paragraph field needs to be normalized with the format `rendr_json`
2. Check for services tagged `ekino_rendr.paragraph_normalizer`
3. If one of this services support the paragraph type, returns the result of the servicee's normalize method
4. If none match, fallback to Drupal's default behaviour

## Implementation

In order to create your own Paragraph Normalizer, you have to create a new service

```yaml
# my_module/my_module.services.yml
# ...
  Drupal\my_module\Normalizer\MyCustomParagraphNormalizer:
    arguments:
      - "my_module.my_custom_paragraph_type"
    tags:
      - { name: "ekino_rendr.paragraph_normalizer" }

```

The create the Normalizer class.

```php
namespace Drupal\my_module\Normalizer;

use Drupal\ekino_rendr\Normalizer\BaseParagraphNormalizer;

/**
 * Paragraph Normalizer.
 */
class MyCustomParagraphNormalizer extends BaseParagraphNormalizer
{
    /**
     * {@inheritdoc}
     */
    public function normalize($paragraph, $format = null, array $context = [])
    {
        $attributes = [];

        $attributes['my_field_name'] = $paragraph->get('my_field_name')->value;
        // ParagraphNormalizer can access the Serializer service via it's context
        // This prevents circular refence issue
        $attributes['image'] = $context['serializer']->normalise($paragraph->get('image'), $format, $context);

        return $attributes;
    }
}

```

Examples of `ParagraphNormalizer`s can be found [here](https://github.com/ekino/rendr/tree/master/examples/cms-drupal/src/html/modules/custom/rendr_demo/src/Normalizer)

