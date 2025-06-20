function setData(row, col, info, stats) {
  const __SHEET = SpreadsheetApp.getActiveSpreadsheet();
  let activeSheet = __SHEET.getActiveSheet();

  activeSheet.getRange(row, col, info.length, info[0].length).setValues(info);
  activeSheet.getRange(row, col + info[0].length + 1, stats.length, stats[0].length).setValues(stats);

  return true;
}

function getInfo(query, max, order, type) {
  const __SEARCH = YouTube.Search.list("snippet, id",
                    { q: query, maxResults: max, order: order, type: type, safeSearch: 'none' });
  const __RET = __SEARCH.items.map(info =>
                  [ info.id.videoId, info.id.channelId, info.id.playlistId, info.kind,
                    info.snippet.title, info.snippet.description, info.snippet.publishedAt,
                    info.snippet.channelId, info.snippet.channelTitle ]);

  return __RET;
}

function getStats(ids) {
  const __STATS = YouTube.Videos.list("statistics", { id: ids });
  const __RET = __STATS.items.map(item => [
                    item.statistics.viewCount, item.statistics.likeCount,
                    item.statistics.commentCount ]);

  return __RET;
}

function safeID(video, channel, playlist) {
  if (video) return video;
  if (channel) return channel;
  if (playlist) return playlist;

  return 'jNQXAC9IVRw';  // ZOO Video
}

function runSearch() {
  const __ROW = 2;
  const __COL = 1;
  const __QUERY = "lovebites";
  const __MAX = 50;  // 0..50, default: 5
  const __ORDER = 'date';  // default: 'relevance'
  const __TYPE = 'video';  // default: 'video,channel,playlist'
  const __INFO = getInfo(__QUERY, __MAX, __ORDER, __TYPE);
  const __IDS = __INFO.map(info => safeID(info[0], info[1], info[2])).join(',');
  const __STATS = getStats(__IDS);

  return setData(__ROW, __COL, __INFO, __STATS);
}
