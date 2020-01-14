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
            return (file_save_data(file_get_contents($image_path), 'public://' . basename($image_path), FileSystemInterface::EXISTS_REPLACE))->id();
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
                'rendr_field_title' => 'Need a Demo fast ?',
                'rendr_field_display' => 'hero, text_center, half_screen_height',
                'rendr_field_text' => '<p>Quite regularly, 
you want to build a simple demo with no complex setup, 
but enough flexibility to play with and demonstrate behaviours.</p>
<p><strong>tags:</strong> hero, text_center, half_screen_height</p>',
                'rendr_field_image' => [
                    'target_id' => $image_callback(__DIR__ . '/assets/benjamin-voros-phIFdC6lA4E-unsplash.jpg'),
                    'alt' => 'mountain'
                ],
            ]),
            Paragraph::create([
                'type' => 'ekino_rendr',
                'rendr_field_title' => 'Showcasing Articles',
                'rendr_field_display' => 'img_left, 2_col',
                'rendr_field_text' => '<p>With a small summary. 
Lorem ipsum dolor sit amet, consectetur adipiscing elit,
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat</p>
<p><strong>tags:</strong> img_left, 2_col</p>',
                'rendr_field_image' => [
                    'target_id' => $image_callback(__DIR__ . '/assets/matthew-guay-Q7wDdmgCBFg-unsplash.jpg'),
                    'alt' => 'news paper & tablet'
                ],
            ]),
            Paragraph::create([
                'type' => 'ekino_rendr',
                'rendr_field_title' => 'Or showcasing products',
                'rendr_field_display' => 'img_left, 2_col',
                'rendr_field_text' => '<p>With a list of features.</p> 
<ul>
<li><strong>Feature 1:</strong> it is simple</li>
<li><strong>Feature 2:</strong> it is flexible</li>
<li><strong>Feature 2:</strong> it can be extended</li>
</ul>
<p><strong>tags:</strong> img_left, 2_col</p>',
                'rendr_field_image' => [
                    'target_id' => $image_callback(__DIR__ . '/assets/neil-soni-6wdRuK7bVTE-unsplash.jpg'),
                    'alt' => 'news paper & tablet'
                ],
            ]),
            Paragraph::create([
                'type' => 'ekino_rendr',
                'rendr_field_title' => 'Little css',
                'rendr_field_display' => 'background_color_light_grey, 3_col, text_center',
                'rendr_field_text' => '<p>It mostly uses a grid system
based on cols and rows
like bootstrap css.</p> 
<p><strong>tags:</strong> background_color_light_grey, 3_col, text_center</p>',
            ]),
            Paragraph::create([
                'type' => 'ekino_rendr',
                'rendr_field_title' => 'React templates',
                'rendr_field_display' => 'background_color_light_grey, 3_col, text_center',
                'rendr_field_text' => '<p>Templates are made using react.
This is also were the tags are resolved.</p>
<p><a href="#">Some Link</a></p> 
<p><strong>tags:</strong> background_color_light_grey, 3_col, text_center</p>',
            ]),
            Paragraph::create([
                'type' => 'ekino_rendr',
                'rendr_field_title' => 'Simple to contribute',
                'rendr_field_display' => 'background_color_light_grey, 3_col, text_center',
                'rendr_field_text' => '<p>The behaviour of this component is driven 
by the tags you see at the bottom.
You can add your own.
But remember, </p>
<p>THIS COMPONENT ALONE CANNOT SOLVE ALL CASES.</p> 
<p><strong>tags:</strong> background_color_light_grey, 3_col, text_center</p>',
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
            'content' => $content,
            // 'channel' => [
            //     'entity' => $default_channel,
            // ],
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
