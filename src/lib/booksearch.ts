"use server";
// https://www.npmjs.com/package/goodreads-cli
import { Cheerio, CheerioAPI, load } from "cheerio";
import { BookDetailType, BookSearchType } from "~/types";

const BASE_URL = "https://www.goodreads.com/search";

/**
 * Build the search URL with the provided parameters
 * @param {string} query - Search query
 * @param {string} searchType - Type of search (e.g., 'books')
 * @param {string} searchField - Field to search in (e.g., 'title', 'author', 'all')
 * @returns {string} Complete search URL
 */
function buildSearchUrl(
  query: string,
  searchType: string,
  searchField: string,
) {
  const searchParams = new URLSearchParams({
    utf8: "✓",
    q: query,
    search_type: searchType,
  });

  if (searchField !== "all") {
    searchParams.append("search[field]", searchField);
  }

  return `${BASE_URL}?${searchParams.toString()}`;
}

export async function searchBook(
  query: string,
  searchType = "books",
  searchField = "all",
) {
  const searchUrl = buildSearchUrl(query, searchType, searchField);
  const response = await fetch(searchUrl);
  const responseText = await response.text();
  const bookInfo = parseSearchResults(responseText);
  return bookInfo;
}

/**
 * Parse the search results from the page HTML
 * Parse only 1 result
 * @param {string} html - HTML content of the page
 * @returns {Array} Parsed search results
 */
function parseSearchResults(html: string) {
  const $ = load(html);
  const results: BookSearchType[] = [];

  $('tr[itemtype="http://schema.org/Book"]').each((index, element) => {
    const bookData = parseBookData($, element);
    results.push(bookData);
  });

  const sortedResults = results.sort((a, b) => {
    if (a.numberOfRatings === null) return 1;
    if (b.numberOfRatings === null) return -1;
    return Number(b.numberOfRatings) - Number(a.numberOfRatings);
  });

  return sortedResults[0];
}

/**
 * Parse individual book data from a search result row
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {Element} element - Book row element
 * @returns {Object} Parsed book data
 */
function parseBookData($: CheerioAPI, element: any) {
  const book = initializeBookObject($(element));
  parseAuthorsSearch($, $(element), book);
  parsePublishedDateSearch($, $(element), book);
  parseRatingsSearch($, $(element), book);
  parseCoverImageSearch($, $(element), book);
  return book;
}

/**
 * Parse authors from a book row
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {Cheerio} $el - Book row element
 * @param {Object} book - Book object to update
 */
function parseAuthorsSearch($: CheerioAPI, $el: Cheerio<any>, book: any) {
  $el.find(".authorName__container").each((i, authorElement) => {
    book.authors.push(
      $(authorElement).find('span[itemprop="name"]').text().trim(),
    );
  });
}

/**
 * Parse published date from a book row
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {Cheerio} $el - Book row element
 * @param {Object} book - Book object to update
 */
function parsePublishedDateSearch($: CheerioAPI, $el: Cheerio<any>, book: any) {
  const greyText = $el.find(".greyText.smallText.uitext").text();
  const publishedMatch = greyText.match(/published\s+(\d{4})/);
  book.publishedYear = publishedMatch ? publishedMatch[1] : null;
}

/**
 * Parse cover image URL
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {Object} bookDetails - Book details object to update
 */
function parseCoverImageSearch($: CheerioAPI, $el: Cheerio<any>, book: any) {
  let coverImage = $("img.bookCover").attr("src");
  if (coverImage) {
    coverImage = coverImage.replace(
      /\.\_([A-Z]+)([0-9]+)\_\.jpg/,
      "._$1500_.jpg",
    );
  }
  book.coverImage = coverImage || null;
}

/**
 * Parse ratings information from a book row
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {Cheerio} $el - Book row element
 * @param {Object} book - Book object to update
 */
function parseRatingsSearch($: CheerioAPI, $el: Cheerio<any>, book: any) {
  const ratingText = $el.find(".minirating").text();
  const ratingMatch = ratingText.match(/([\d.]+)\s+avg rating/);
  book.averageRating = ratingMatch ? ratingMatch[1] : null;

  const ratingsMatch = ratingText.match(/—\s+([\d,]+)\s+ratings/);
  book.numberOfRatings = ratingsMatch
    ? ratingsMatch[1].replace(/,/g, "")
    : null;
}

/**
 * Initialize a book object with basic data
 * @param {Cheerio} $el - Cheerio element for the book row
 * @returns {Object} Initial book object
 */
function initializeBookObject($el: Cheerio<any>) {
  const detailsUrl =
    "https://www.goodreads.com" + $el.find(".bookTitle").attr("href");
  return {
    title: $el.find('.bookTitle span[itemprop="name"]').text().trim() || null,
    authors: [],
    coverImage: null,
    detailsUrl: detailsUrl || null,
    goodreadsId: detailsUrl.match(/\/show\/(\d+)/)?.[1] || null,
    publishedYear: null,
    averageRating: null,
    numberOfRatings: null,
  } as BookSearchType;
}

/**
 * Main function to look up a book by its Goodreads ID
 * @param {string} goodreadsId - ID of the book to look up
 * @returns {Promise<Object>} Book details
 */
async function lookupBook(goodreadsURL: string) {
  const response = await fetch(goodreadsURL);
  const responseText = await response.text();
  return parseBookDetails(responseText);
}

/**
 * Parse the book details from the page HTML
 * @param {string} html - HTML content of the page
 * @returns {Object} Parsed book details
 */
function parseBookDetails(html: string) {
  const $ = load(html);
  const bookDetails = initializeBookDetailsObject();

  parseTitleAndSeries($, bookDetails);
  parseAuthors($, bookDetails);
  parseRatings($, bookDetails);
  parseCoverImage($, bookDetails);
  parseGenres($, bookDetails);
  parseDescription($, bookDetails);
  parseBasicDetails($, bookDetails);

  return bookDetails;
}

/**
 * Initialize the book details object with empty values
 * @returns {Object} Empty book details object
 */
function initializeBookDetailsObject() {
  return {
    title: "",
    authors: [],
    coverImage: "",
    rating: "",
    numberOfRatings: "",
    numberOfReviews: "",
    series: "",
    genres: [],
    description: "",
    firstPublished: "",
    numberOfPages: "",
  } as BookDetailType;
}

/**
 * Parse title and series information
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {Object} bookDetails - Book details object to update
 */
function parseTitleAndSeries($: CheerioAPI, bookDetails: BookDetailType) {
  const titleSection = $(".BookPageTitleSection__title");
  const seriesElement = titleSection.find("h3.Text__italic a");
  if (seriesElement.length) {
    bookDetails.series = seriesElement.text().trim();
    bookDetails.title = titleSection
      .find('h1[data-testid="bookTitle"]')
      .text()
      .trim();
  } else {
    bookDetails.title = titleSection.text().trim();
  }
}

/**
 * Parse author information
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {Object} bookDetails - Book details object to update
 */
function parseAuthors($: CheerioAPI, bookDetails: BookDetailType) {
  $(".ContributorLinksList .ContributorLink__name").each((i, el) => {
    const authorName = $(el).text().replace(/\s+/g, " ").trim();
    bookDetails.authors.push(authorName);
  });
}

/**
 * Parse ratings and reviews information
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {Object} bookDetails - Book details object to update
 */
function parseRatings($: CheerioAPI, bookDetails: BookDetailType) {
  bookDetails.rating =
    $(".RatingStatistics__rating").first().text().trim() || null;

  const ratingsAndReviews = $(".RatingStatistics__meta").first().text().trim();
  const ratingsMatch = ratingsAndReviews.match(/(\d+(?:,\d+)*)\s+ratings/);
  const reviewsMatch = ratingsAndReviews.match(/(\d+(?:,\d+)*)\s+reviews/);

  bookDetails.numberOfRatings = ratingsMatch
    ? ratingsMatch[1].replace(/,/g, "")
    : null;
  bookDetails.numberOfReviews = reviewsMatch
    ? reviewsMatch[1].replace(/,/g, "")
    : null;
}

/**
 * Parse cover image URL
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {Object} bookDetails - Book details object to update
 */
function parseCoverImage($: CheerioAPI, bookDetails: BookDetailType) {
  const coverImage = $(".BookCover__image img.ResponsiveImage").attr("src");
  bookDetails.coverImage = coverImage || null;
}

/**
 * Parse genre information
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {Object} bookDetails - Book details object to update
 */
function parseGenres($: CheerioAPI, bookDetails: BookDetailType) {
  $(".BookPageMetadataSection__genres .Button__labelItem").each((i, el) => {
    const genreName = $(el).text().trim();
    if (genreName !== "...show all") {
      bookDetails.genres.push(genreName);
    }
  });
}

/**
 * Parse description information
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {Object} bookDetails - Book details object to update
 */
function parseDescription($: CheerioAPI, bookDetails: BookDetailType) {
  const descriptionDiv = $(".BookPageMetadataSection__description");
  if (descriptionDiv.length) {
    // Get the text from the first div inside the description section
    const description = descriptionDiv
      .find(".TruncatedContent__text")
      .first()
      .text()
      .trim();
    bookDetails.description = description || null;
  }
}

/**
 * Parse basic book details like pages and publication date
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {Object} bookDetails - Book details object to update
 */
function parseBasicDetails($: CheerioAPI, bookDetails: BookDetailType) {
  const pagesFormat = $('p[data-testid="pagesFormat"]').text().trim();
  const pagesMatch = pagesFormat.match(/(\d+)\s*pages/);
  if (pagesMatch) {
    bookDetails.numberOfPages = pagesMatch[1];
  }

  const publicationInfo = $('p[data-testid="publicationInfo"]').text().trim();
  const publishedMatch = publicationInfo.match(/First published\s+(.+)/);
  if (publishedMatch) {
    bookDetails.firstPublished = publishedMatch[1].trim();
  }
}
