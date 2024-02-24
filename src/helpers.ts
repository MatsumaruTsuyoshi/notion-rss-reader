// URLモジュールをインポート
import { URL } from 'url'

export const timeDifference = (publishedDate: number) => {
  const todaysDate = new Date().getTime() / 1000
  const difference = Math.floor(todaysDate) - Math.floor(publishedDate)
  const diffInHours = Math.floor(difference / 60 / 60)

  return {
    diffInHours,
  }
}

// google alertでRSSフィードを読むとhttps://google...がついてくるので省く処理
export const removeGoogleDomainUrl = (inputUrl: string) => {
  const urlObj = new URL(inputUrl)
  // "url" クエリパラメータの値を取得
  const targetUrl = urlObj.searchParams.get('url')
  return targetUrl
}
