import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
const blog=defineCollection({
 loader:glob({base:'./src/content/blog',pattern:'**/*.{md,mdx}'}),
 schema:({image})=>z.object({
 title:z.string(),description:z.string(),pubDate:z.coerce.date(),updatedDate:z.coerce.date().optional(),
 heroImage:z.optional(image()),cover:z.string().default('/images/sakura-sunset.webp'),
 category:z.string().default('开发随笔'),tags:z.array(z.string()).default([]),
 readingTime:z.number().positive().default(3),draft:z.boolean().default(true),
 type:z.enum(['project','learning','knowledge','essay']).optional(),
 summary:z.array(z.string()).max(6).default([]),
 relatedProject:z.enum(['orulink','taskhub','clotheshub']).optional(),
 coverCaption:z.string().optional(),
    reading:z.object({
      author:z.string(),authorUrl:z.string().url(),originalTitle:z.string(),originalUrl:z.string().url(),
      originalDate:z.coerce.date(),checkedDate:z.coerce.date(),
      aiTopic:z.boolean().default(false),aiAssisted:z.boolean().default(false)
    }).optional(),
 resources:z.array(z.object({title:z.string(),url:z.string().refine(url=>/^https?:\/\//.test(url)||(url.startsWith('/')&&!url.startsWith('//')),'Use an http(s) URL or a site-relative path')})).default([])
 })
});
export const collections={blog};
