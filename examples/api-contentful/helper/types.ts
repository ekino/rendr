import { BlockDefinition } from "@ekino/rendr-core";
import {
  BaseContentfulBlock,
  ContentfulAsset,
  ContentfulWebsite,
  Website,
  Asset
} from "@ekino/rendr-loader-contentful";
import { Entry } from "contentful";

export interface ContentfulAuthor {
  name: string;
  job_title: string;
  slug: string;
  social_twitter: string;
  social_facebook: string;
  social_linkedin: string;
  biography: string;
  image: ContentfulAsset;
}

export interface ContentfulBlockText extends BaseContentfulBlock {
  title: string;
  subtitle: string;
  contents: string;
  mode: string;
  image: ContentfulAsset;
  image_position: string;
}

export interface ContentfulArticle {
  type: string;
  title: string;
  abstract: string;
  seo_description: string;
  seo_keywords: string;
  slug: string;
  website: Entry<ContentfulWebsite>;
  published_at: string;
  authors: Entry<ContentfulAuthor>[];
  blocks: Entry<any>[];
  image_list: ContentfulAsset;
  image_header: ContentfulAsset;
}

export interface Article {
  id: string;
  type: string;
  title: string;
  abstract: string;
  seo: {
    description: string;
    keywords: string;
  };
  slug: string;
  website: Website;
  published_at: string;
  authors: Author[];
  blocks: BlockDefinition[];
  images: {
    list: Asset;
    header: Asset;
  };
}

export interface Author {
  id: string;
  name: string;
  jobTitle: string;
  slug: string;
  social: {
    twitter: string;
    facebook: string;
    linkedin: string;
  };
  biography: string;
  image: Asset;
}
