const MEDIA_SUMMARY_FIELDS = `
  id
  idMal
  title { romaji english native userPreferred }
  coverImage { large extraLarge color }
  bannerImage
  format
  episodes
  averageScore
  status
  season
  seasonYear
  genres
`;

export const LIST_QUERY = `
query ($perPage: Int!, $sort: [MediaSort], $status: MediaStatus, $format: MediaFormat, $genre: String, $season: MediaSeason, $seasonYear: Int) {
  Page(perPage: $perPage) {
    media(type: ANIME, sort: $sort, status: $status, format: $format, genre: $genre, season: $season, seasonYear: $seasonYear, isAdult: false) {
      ${MEDIA_SUMMARY_FIELDS}
    }
  }
}
`;

export const SEARCH_QUERY = `
query ($q: String!, $perPage: Int!) {
  Page(perPage: $perPage) {
    media(type: ANIME, search: $q, sort: SEARCH_MATCH, isAdult: false) {
      ${MEDIA_SUMMARY_FIELDS}
    }
  }
}
`;

export const DETAIL_QUERY = `
query ($id: Int!) {
  Media(id: $id, type: ANIME) {
    ${MEDIA_SUMMARY_FIELDS}
    description(asHtml: false)
    duration
    studios(isMain: true) { nodes { id name } }
    trailer { id site thumbnail }
    relations {
      edges {
        relationType
        node { ${MEDIA_SUMMARY_FIELDS} }
      }
    }
    recommendations(perPage: 12, sort: RATING_DESC) {
      nodes {
        mediaRecommendation { ${MEDIA_SUMMARY_FIELDS} }
      }
    }
    characters(perPage: 12, sort: ROLE) {
      edges {
        role
        node {
          id
          name { full }
          image { medium }
        }
        voiceActors(language: JAPANESE) {
          id
          name { full }
          image { medium }
        }
      }
    }
  }
}
`;
