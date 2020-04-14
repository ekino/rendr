<?php

namespace Drupal\rendr_demo\DataFixtures;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\data_fixtures\Interfaces\Generator;
use Drupal\ekino_rendr\Entity\Page;
use Drupal\paragraphs\Entity\Paragraph;

final class PageGenerator implements Generator
{
    private $entityTypeManager;

    public function __construct(EntityTypeManagerInterface $entity_type_manager)
    {
        $this->entityTypeManager = $entity_type_manager;
    }

    /**
     * {@inheritdoc}
     */
    public function load(): void
    {
        $template = $this->entityTypeManager->getStorage('ekino_rendr_template')->loadByProperties();

        if (1 !== count($template)) {
            throw new \RuntimeException('Could not find the default template.');
        }

        $default_template = reset($template);

        $image_callback = function ($image_path) {
            return (file_save_data(file_get_contents($image_path), 'public://'.basename($image_path), FileSystemInterface::EXISTS_REPLACE))->id();
        };

        $pages = $this->entityTypeManager->getStorage('ekino_rendr_page')->loadByProperties([
            'title' => 'Home',
        ]);

        if (count($pages) > 0) {
            // Page already exists
            return;
        }

        $title = 'Home';
        $path = '/';
        $paragraphs = [
            Paragraph::create([
                'type' => 'ekino_rendr',
                'field_rendr_title' => 'Ekino Rendr',
                'field_rendr_display' => 'standard',
                'field_rendr_description' => '<p>There are many challenges when doing Server Side Rendering with React (or any other similar stacks), it is not only about setting up a state management, or select the best CSS framework. The first challenge is on the logical architecture level, where do we put business logic, how can we do data aggregation, how can we do http caching with user\'s data, etc ... The second challenge, is how can we add flexibility to the end user to administrate the page layouts or templates (and not only contents).</p>',
                'field_rendr_image' => [
                    'target_id' => $image_callback(__DIR__.'/assets/benjamin-voros-phIFdC6lA4E-unsplash.jpg'),
                    'alt' => 'mountain',
                ],
            ]),
            Paragraph::create([
                'type' => 'ekino_rendr',
                'field_rendr_title' => 'When do you need this kind of solution?',
                'field_rendr_description' => '<ul>
<li>You have internal data sources (microservices or legacy system)</li>
<li>You have a CMS but don\'t want to add custom codes or don\'t want to expose it to the world</li>
<li>Your CMS cannot do the aggregation from different data sources</li>
<li>You need to add some cache mechanisms to protect your internals systems</li>
</ul>',
                'field_rendr_image' => [
                    'target_id' => $image_callback(__DIR__.'/assets/matthew-guay-Q7wDdmgCBFg-unsplash.jpg'),
                    'alt' => 'news paper & tablet',
                ],
            ]),
        ];

        $content = [];

        /** @var Paragraph $paragraph */
        foreach ($paragraphs as $paragraph) {
            $paragraph->enforceIsNew();
            $paragraph->save();

            $content[] = $paragraph;
        }

        $page = Page::create([
            'template' => $default_template->id,
            'type' => 'ekino_rendr_page',
            'title' => $title,
            'path' => $path,
            'field_rendr_body_container' => $content,
            // Default channel is normally created with id 1
            'channels' => [1],
        ]);
        $page->setPublished(true);

        $page->enforceIsNew();
        $page->save();
    }

    /**
     * {@inheritdoc}
     */
    public function unLoad(): void
    {
        $storage = $this->entityTypeManager->getStorage('node');

        $storage->delete($storage->loadByProperties([
            'type' => 'ekino_rendr_page',
        ]));
    }
}
