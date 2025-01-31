import { Client } from '@notionhq/client'
import { CreatePageParameters } from '@notionhq/client/build/src/api-endpoints'
import ogp from 'ogp-parser'
import { removeGoogleDomainUrl } from './helpers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TODO = any

export const addFeedItems = async (
  newFeedItems: {
    [key: string]: TODO
  }[]
) => {
  const notion = new Client({ auth: process.env.NOTION_KEY })
  const databaseId = process.env.NOTION_READER_DATABASE_ID || ''

  // タイトルの重複をチェックするためのセットを用意
  const titlesSet = new Set()

  // 重複しないアイテムのみをフィルタリング
  const uniqueFeedItems = newFeedItems.filter((item) => {
    const isUnique = !titlesSet.has(item.title)
    titlesSet.add(item.title)
    return isUnique
  })

  uniqueFeedItems.forEach(async (item) => {
    const { title, link, enclosure, pubDate } = item

    const removedGoogleDomainUrl = removeGoogleDomainUrl(link)
    const domain = removedGoogleDomainUrl?.match(
      /^https?:\/{2,}(.*?)(?:\/|\?|#|$)/
    )

    const properties: TODO = {
      Title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      URL: {
        url: removedGoogleDomainUrl,
      },
      Domain: {
        select: {
          name: domain ? domain[1] : null,
        },
      },
      'Created At': {
        rich_text: [
          {
            text: {
              content: pubDate,
            },
          },
        ],
      },
    }

    const ogpImage = link
      ? await ogp(link).then((data) => {
          const imageList = data.ogp['og:image']
          return imageList ? imageList[0] : null
        })
      : ''

    const children: CreatePageParameters['children'] = enclosure
      ? [
          {
            type: 'image',
            image: {
              type: 'external',
              external: {
                url: enclosure?.url,
              },
            },
          },
        ]
      : ogpImage
      ? [
          {
            type: 'image',
            image: {
              type: 'external',
              external: {
                url: ogpImage,
              },
            },
          },
        ]
      : []

    try {
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties,
        children,
      })
    } catch (error) {
      console.error(error)
    }
  })
}
