'use strict';

// WARNING
//
// This only supports mapping from one concept in between all taxonomies except sections.
//
// WARNING 2
//
// Except for specifically defined circumstances when mapping across taxonomies the old tags
// might stay on primaryTheme and primarySection parts of the metadata object.
//
// Talk to Matt A before proceeding.

const authors = require('./authors');
const brand = require('./brand');
const genre = require('./genre');
const organisations = require('./organisations');
const people = require('./people');
const regions = require('./regions');
const sections = require('./sections');
const specialReports = require('./special-reports');
const topic = require('./topic');

module.exports = Object.assign({}, authors, brand, genre, organisations, people, regions, sections, specialReports, topic);
