<?php

declare(strict_types=1);

namespace Drupal\rendr_demo\Normalizer;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\ekino_rendr\Normalizer\BaseParagraphNormalizer;

/**
 * Text Paragraph transformer.
 */
class ArticleParagraphNormalizer extends BaseParagraphNormalizer
{
    /**
     * @var EntityTypeManagerInterface
     */
    protected $entityTypeManager;

    /**
     * {@inheritdoc}
     */
    public function __construct($supported_paragraph_type, EntityTypeManagerInterface $entityTypeManager)
    {
        parent::__construct($supported_paragraph_type);
        $this->entityTypeManager = $entityTypeManager;
    }
    /**
     * {@inheritdoc}
     */
    public function normalize($object, $format = null, array $context = [])
    {
        $articles = $this->entityTypeManager->getStorage('node')->loadByProperties([
            'nid' => $object->get('field_article')->getValue()[0]['target_id']
        ]);
        $article = reset($articles);

        return [
            'id' => $object->get('id'),
            'container' => 'body',
            'type' => 'rendr.articles',
            'settings' => [
                'article' => $this->normalizeArticle($article),
            ],
        ];
    }

    protected function normalizeArticle($article)
    {
        return [
            'title' => $article->get('title')->value,
            'body' => $article->get('body')->value,
        ];
    }
}
