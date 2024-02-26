import Parser from 'rss-parser'
import { timeDifference } from './helpers'

const parser = new Parser()

export const getNewFeedItems = async (feedUrl: string) => {
  const { items: newFeedItems } = await parser.parseURL(feedUrl)

  return newFeedItems
}
