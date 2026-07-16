import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech'
import { THEMES } from '../themes'
import { getWorldExplorerStars } from '../utils/moduleScoring'

// ── Country data (ISO 3166-1 alpha-2 codes for flagcdn.com) ──────────────────
const COUNTRIES = [
  // ── Europe ──
  { name: 'United Kingdom', code: 'gb', capital: 'London',     currency: 'Pound Sterling',  region: 'Europe',   fact: 'Home to Big Ben and Buckingham Palace!' },
  { name: 'France',         code: 'fr', capital: 'Paris',      currency: 'Euro',             region: 'Europe',   fact: 'The Eiffel Tower is in Paris!' },
  { name: 'Germany',        code: 'de', capital: 'Berlin',     currency: 'Euro',             region: 'Europe',   fact: 'Famous for sausages and cuckoo clocks!' },
  { name: 'Italy',          code: 'it', capital: 'Rome',       currency: 'Euro',             region: 'Europe',   fact: 'Italy is shaped like a boot!' },
  { name: 'Spain',          code: 'es', capital: 'Madrid',     currency: 'Euro',             region: 'Europe',   fact: 'Flamenco dancing is from Spain!' },
  { name: 'Portugal',       code: 'pt', capital: 'Lisbon',     currency: 'Euro',             region: 'Europe',   fact: 'Famous for tarts called pasteis de nata!' },
  { name: 'Netherlands',    code: 'nl', capital: 'Amsterdam',  currency: 'Euro',             region: 'Europe',   fact: 'Famous for windmills and tulips!' },
  { name: 'Belgium',        code: 'be', capital: 'Brussels',   currency: 'Euro',             region: 'Europe',   fact: 'Home of chocolate and waffles!' },
  { name: 'Switzerland',    code: 'ch', capital: 'Bern',       currency: 'Swiss Franc',      region: 'Europe',   fact: 'Famous for cheese, chocolate and mountains!' },
  { name: 'Austria',        code: 'at', capital: 'Vienna',     currency: 'Euro',             region: 'Europe',   fact: 'Mozart was born in Austria!' },
  { name: 'Sweden',         code: 'se', capital: 'Stockholm',  currency: 'Swedish Krona',    region: 'Europe',   fact: 'ABBA and IKEA are from Sweden!' },
  { name: 'Norway',         code: 'no', capital: 'Oslo',       currency: 'Norwegian Krone',  region: 'Europe',   fact: 'Land of the midnight sun!' },
  { name: 'Denmark',        code: 'dk', capital: 'Copenhagen', currency: 'Danish Krone',     region: 'Europe',   fact: 'Home of LEGO!' },
  { name: 'Finland',        code: 'fi', capital: 'Helsinki',   currency: 'Euro',             region: 'Europe',   fact: 'Santa Claus is said to live here!' },
  { name: 'Poland',         code: 'pl', capital: 'Warsaw',     currency: 'Polish Zloty',     region: 'Europe',   fact: 'Marie Curie was born in Poland!' },
  { name: 'Greece',         code: 'gr', capital: 'Athens',     currency: 'Euro',             region: 'Europe',   fact: 'Home of the ancient Olympics!' },
  { name: 'Ireland',        code: 'ie', capital: 'Dublin',     currency: 'Euro',             region: 'Europe',   fact: 'Famous for its green shamrocks!' },
  { name: 'Romania',        code: 'ro', capital: 'Bucharest',  currency: 'Romanian Leu',     region: 'Europe',   fact: "Home of Dracula's castle!" },
  { name: 'Czech Republic', code: 'cz', capital: 'Prague',     currency: 'Czech Koruna',     region: 'Europe',   fact: 'Prague has a famous astronomical clock!' },
  { name: 'Hungary',        code: 'hu', capital: 'Budapest',   currency: 'Forint',           region: 'Europe',   fact: 'Famous for goulash soup!' },
  { name: 'Croatia',        code: 'hr', capital: 'Zagreb',     currency: 'Euro',             region: 'Europe',   fact: 'Has beautiful blue Adriatic beaches!' },
  { name: 'Ukraine',        code: 'ua', capital: 'Kyiv',       currency: 'Hryvnia',          region: 'Europe',   fact: "One of Europe's largest countries!" },
  { name: 'Russia',         code: 'ru', capital: 'Moscow',     currency: 'Russian Ruble',    region: 'Europe',   fact: 'The largest country in the world!' },
  { name: 'Turkey',         code: 'tr', capital: 'Ankara',     currency: 'Turkish Lira',     region: 'Europe',   fact: 'Spans two continents!' },
  { name: 'Serbia',         code: 'rs', capital: 'Belgrade',   currency: 'Serbian Dinar',    region: 'Europe',   fact: 'Nikola Tesla was from Serbia!' },
  { name: 'Bulgaria',       code: 'bg', capital: 'Sofia',      currency: 'Bulgarian Lev',    region: 'Europe',   fact: 'Famous for rose oil perfume!' },
  { name: 'Slovakia',       code: 'sk', capital: 'Bratislava', currency: 'Euro',             region: 'Europe',   fact: 'Has over 180 castles!' },
  { name: 'Lithuania',      code: 'lt', capital: 'Vilnius',    currency: 'Euro',             region: 'Europe',   fact: 'Its flag has three colourful stripes!' },
  { name: 'Latvia',         code: 'lv', capital: 'Riga',       currency: 'Euro',             region: 'Europe',   fact: 'Beautiful amber found on its beaches!' },
  { name: 'Estonia',        code: 'ee', capital: 'Tallinn',    currency: 'Euro',             region: 'Europe',   fact: 'One of the most digital countries!' },
  { name: 'Iceland',        code: 'is', capital: 'Reykjavik',  currency: 'Icelandic Krona',  region: 'Europe',   fact: 'Land of volcanoes and geysers!' },
  { name: 'Luxembourg',     code: 'lu', capital: 'Luxembourg', currency: 'Euro',             region: 'Europe',   fact: 'One of the smallest countries!' },
  { name: 'Malta',          code: 'mt', capital: 'Valletta',   currency: 'Euro',             region: 'Europe',   fact: 'Has ancient temples older than Stonehenge!' },

  // ── Asia ──
  { name: 'India',          code: 'in', capital: 'New Delhi',    currency: 'Indian Rupee',       region: 'Asia', fact: 'Home of the Taj Mahal!' },
  { name: 'China',          code: 'cn', capital: 'Beijing',      currency: 'Chinese Yuan',       region: 'Asia', fact: 'The Great Wall stretches thousands of miles!' },
  { name: 'Japan',          code: 'jp', capital: 'Tokyo',        currency: 'Japanese Yen',       region: 'Asia', fact: 'Land of cherry blossoms and sushi!' },
  { name: 'South Korea',    code: 'kr', capital: 'Seoul',        currency: 'South Korean Won',   region: 'Asia', fact: 'Famous for K-Pop music!' },
  { name: 'Saudi Arabia',   code: 'sa', capital: 'Riyadh',       currency: 'Saudi Riyal',        region: 'Asia', fact: "Has the world's largest sand desert!" },
  { name: 'UAE',            code: 'ae', capital: 'Abu Dhabi',    currency: 'UAE Dirham',         region: 'Asia', fact: "Home of the world's tallest building!" },
  { name: 'Pakistan',       code: 'pk', capital: 'Islamabad',    currency: 'Pakistani Rupee',    region: 'Asia', fact: 'Has the second highest mountain K2!' },
  { name: 'Bangladesh',     code: 'bd', capital: 'Dhaka',        currency: 'Bangladeshi Taka',   region: 'Asia', fact: 'Famous for delicious hilsa fish!' },
  { name: 'Sri Lanka',      code: 'lk', capital: 'Sri Jayawardenepura Kotte', currency: 'Sri Lankan Rupee', region: 'Asia', fact: 'Island nation shaped like a teardrop!' },
  { name: 'Thailand',       code: 'th', capital: 'Bangkok',      currency: 'Thai Baht',          region: 'Asia', fact: 'Elephants are a symbol of Thailand!' },
  { name: 'Vietnam',        code: 'vn', capital: 'Hanoi',        currency: 'Vietnamese Dong',    region: 'Asia', fact: 'Famous for pho noodle soup!' },
  { name: 'Indonesia',      code: 'id', capital: 'Jakarta',      currency: 'Indonesian Rupiah',  region: 'Asia', fact: 'Has over 17,000 islands!' },
  { name: 'Malaysia',       code: 'my', capital: 'Kuala Lumpur', currency: 'Malaysian Ringgit',  region: 'Asia', fact: 'Famous for the twin Petronas Towers!' },
  { name: 'Philippines',    code: 'ph', capital: 'Manila',       currency: 'Philippine Peso',    region: 'Asia', fact: 'An archipelago of over 7,600 islands!' },
  { name: 'Singapore',      code: 'sg', capital: 'Singapore',    currency: 'Singapore Dollar',   region: 'Asia', fact: 'A tiny city-state and country!' },
  { name: 'Nepal',          code: 'np', capital: 'Kathmandu',    currency: 'Nepalese Rupee',     region: 'Asia', fact: 'Mount Everest, the highest peak, is here!' },
  { name: 'Myanmar',        code: 'mm', capital: 'Naypyidaw',    currency: 'Kyat',               region: 'Asia', fact: 'Famous for golden pagoda temples!' },
  { name: 'Cambodia',       code: 'kh', capital: 'Phnom Penh',   currency: 'Cambodian Riel',     region: 'Asia', fact: 'Home of the ancient Angkor Wat temple!' },
  { name: 'Iraq',           code: 'iq', capital: 'Baghdad',      currency: 'Iraqi Dinar',        region: 'Asia', fact: 'Home of ancient Mesopotamia!' },
  { name: 'Iran',           code: 'ir', capital: 'Tehran',       currency: 'Iranian Rial',       region: 'Asia', fact: 'Has beautiful mosaic-tiled mosques!' },
  { name: 'Israel',         code: 'il', capital: 'Jerusalem',    currency: 'Israeli Shekel',     region: 'Asia', fact: 'Has the Dead Sea, the saltiest lake!' },
  { name: 'Jordan',         code: 'jo', capital: 'Amman',        currency: 'Jordanian Dinar',    region: 'Asia', fact: 'Home of the ancient city of Petra!' },
  { name: 'Qatar',          code: 'qa', capital: 'Doha',         currency: 'Qatari Riyal',       region: 'Asia', fact: 'Hosted the 2022 FIFA World Cup!' },
  { name: 'Kuwait',         code: 'kw', capital: 'Kuwait City',  currency: 'Kuwaiti Dinar',      region: 'Asia', fact: 'One of the richest countries per person!' },
  { name: 'Afghanistan',    code: 'af', capital: 'Kabul',        currency: 'Afghan Afghani',     region: 'Asia', fact: 'Famous for beautiful pomegranates!' },
  { name: 'Uzbekistan',     code: 'uz', capital: 'Tashkent',     currency: 'Uzbekistani Som',    region: 'Asia', fact: 'Famous for the ancient Silk Road!' },
  { name: 'Kazakhstan',     code: 'kz', capital: 'Astana',       currency: 'Kazakhstani Tenge',  region: 'Asia', fact: "The world's largest landlocked country!" },
  { name: 'Mongolia',       code: 'mn', capital: 'Ulaanbaatar',  currency: 'Mongolian Togrog',   region: 'Asia', fact: 'Land of wide open grassy steppes!' },
  { name: 'Laos',           code: 'la', capital: 'Vientiane',    currency: 'Lao Kip',            region: 'Asia', fact: 'Has millions of ancient Buddha statues!' },
  { name: 'Bhutan',         code: 'bt', capital: 'Thimphu',      currency: 'Bhutanese Ngultrum', region: 'Asia', fact: 'Measures Gross National Happiness!' },
  { name: 'Maldives',       code: 'mv', capital: 'Male',         currency: 'Maldivian Rufiyaa',  region: 'Asia', fact: 'A stunning ocean island nation!' },
  { name: 'Armenia',        code: 'am', capital: 'Yerevan',      currency: 'Armenian Dram',      region: 'Asia', fact: "Has one of the world's oldest churches!" },
  { name: 'Georgia',        code: 'ge', capital: 'Tbilisi',      currency: 'Georgian Lari',      region: 'Asia', fact: 'Famous for ancient cave cities!' },
  { name: 'Cyprus',         code: 'cy', capital: 'Nicosia',      currency: 'Euro',               region: 'Asia', fact: 'An island in the Mediterranean Sea!' },
  { name: 'North Korea',    code: 'kp', capital: 'Pyongyang',    currency: 'North Korean Won',   region: 'Asia', fact: 'A very secretive country!' },

  // ── Africa ──
  { name: 'Egypt',          code: 'eg', capital: 'Cairo',          currency: 'Egyptian Pound',      region: 'Africa', fact: 'Home of the famous Pyramids!' },
  { name: 'Nigeria',        code: 'ng', capital: 'Abuja',          currency: 'Nigerian Naira',      region: 'Africa', fact: "Africa's most populous country!" },
  { name: 'South Africa',   code: 'za', capital: 'Pretoria',       currency: 'South African Rand',  region: 'Africa', fact: 'Has three capital cities!', capitalQuiz: false },
  { name: 'Kenya',          code: 'ke', capital: 'Nairobi',        currency: 'Kenyan Shilling',     region: 'Africa', fact: 'Famous for the Great Migration of wildebeest!' },
  { name: 'Ghana',          code: 'gh', capital: 'Accra',          currency: 'Ghanaian Cedi',       region: 'Africa', fact: "Produces lots of the world's chocolate cocoa!" },
  { name: 'Ethiopia',       code: 'et', capital: 'Addis Ababa',    currency: 'Ethiopian Birr',      region: 'Africa', fact: 'The birthplace of coffee!' },
  { name: 'Tanzania',       code: 'tz', capital: 'Dodoma',         currency: 'Tanzanian Shilling',  region: 'Africa', fact: "Home of Mount Kilimanjaro, Africa's highest peak!" },
  { name: 'Morocco',        code: 'ma', capital: 'Rabat',          currency: 'Moroccan Dirham',     region: 'Africa', fact: 'Famous for colourful souks and spices!' },
  { name: 'Senegal',        code: 'sn', capital: 'Dakar',          currency: 'West African CFA',    region: 'Africa', fact: 'Known for its amazing wrestling sport!' },
  { name: 'Uganda',         code: 'ug', capital: 'Kampala',        currency: 'Ugandan Shilling',    region: 'Africa', fact: 'Home of mountain gorillas!' },
  { name: 'Zimbabwe',       code: 'zw', capital: 'Harare',         currency: 'Zimbabwean Dollar',   region: 'Africa', fact: 'Has the spectacular Victoria Falls!' },
  { name: 'Cameroon',       code: 'cm', capital: 'Yaounde',        currency: 'Central African CFA', region: 'Africa', fact: 'Called Africa in miniature!' },
  { name: 'Ivory Coast',    code: 'ci', capital: 'Yamoussoukro',   currency: 'West African CFA',    region: 'Africa', fact: "World's top cocoa producer!" },
  { name: 'Algeria',        code: 'dz', capital: 'Algiers',        currency: 'Algerian Dinar',      region: 'Africa', fact: "Africa's largest country by area!" },
  { name: 'Sudan',          code: 'sd', capital: 'Khartoum',       currency: 'Sudanese Pound',      region: 'Africa', fact: 'Has more pyramids than Egypt!' },
  { name: 'Madagascar',     code: 'mg', capital: 'Antananarivo',   currency: 'Malagasy Ariary',     region: 'Africa', fact: 'Island home of lemurs found nowhere else!' },
  { name: 'Angola',         code: 'ao', capital: 'Luanda',         currency: 'Angolan Kwanza',      region: 'Africa', fact: 'Famous for its rare giant sable antelope!' },
  { name: 'Mozambique',     code: 'mz', capital: 'Maputo',         currency: 'Mozambican Metical',  region: 'Africa', fact: 'Has beautiful coral reef coastlines!' },
  { name: 'Rwanda',         code: 'rw', capital: 'Kigali',         currency: 'Rwandan Franc',       region: 'Africa', fact: 'Called the land of a thousand hills!' },
  { name: 'Zambia',         code: 'zm', capital: 'Lusaka',         currency: 'Zambian Kwacha',      region: 'Africa', fact: 'Victoria Falls are on its border!' },
  { name: 'Tunisia',        code: 'tn', capital: 'Tunis',          currency: 'Tunisian Dinar',      region: 'Africa', fact: 'Star Wars was filmed in its Sahara desert!' },
  { name: 'Libya',          code: 'ly', capital: 'Tripoli',        currency: 'Libyan Dinar',        region: 'Africa', fact: 'Has ancient Roman ruins at Leptis Magna!' },
  { name: 'Botswana',       code: 'bw', capital: 'Gaborone',       currency: 'Botswana Pula',       region: 'Africa', fact: 'Has the Okavango Delta, a desert oasis!' },
  { name: 'Namibia',        code: 'na', capital: 'Windhoek',       currency: 'Namibian Dollar',     region: 'Africa', fact: "Has the world's oldest desert, the Namib!" },
  { name: 'Somalia',        code: 'so', capital: 'Mogadishu',      currency: 'Somali Shilling',     region: 'Africa', fact: 'Has one of the longest coastlines in Africa!' },
  { name: 'Mali',           code: 'ml', capital: 'Bamako',         currency: 'West African CFA',    region: 'Africa', fact: 'Home to ancient Timbuktu!' },

  // ── Americas ──
  { name: 'USA',                 code: 'us', capital: 'Washington DC',  currency: 'US Dollar',           region: 'Americas', fact: 'Has 50 states and the Statue of Liberty!' },
  { name: 'Canada',              code: 'ca', capital: 'Ottawa',         currency: 'Canadian Dollar',      region: 'Americas', fact: 'Second largest country in the world!' },
  { name: 'Mexico',              code: 'mx', capital: 'Mexico City',    currency: 'Mexican Peso',         region: 'Americas', fact: 'Famous for tacos and ancient Aztec pyramids!' },
  { name: 'Brazil',              code: 'br', capital: 'Brasilia',       currency: 'Brazilian Real',       region: 'Americas', fact: 'Has the mighty Amazon rainforest!' },
  { name: 'Argentina',           code: 'ar', capital: 'Buenos Aires',   currency: 'Argentine Peso',       region: 'Americas', fact: 'Birthplace of tango dance!' },
  { name: 'Colombia',            code: 'co', capital: 'Bogota',         currency: 'Colombian Peso',       region: 'Americas', fact: 'Named after Christopher Columbus!' },
  { name: 'Peru',                code: 'pe', capital: 'Lima',           currency: 'Peruvian Sol',         region: 'Americas', fact: 'Home of Machu Picchu!' },
  { name: 'Chile',               code: 'cl', capital: 'Santiago',       currency: 'Chilean Peso',         region: 'Americas', fact: 'One of the longest and narrowest countries!' },
  { name: 'Venezuela',           code: 've', capital: 'Caracas',        currency: 'Venezuelan Bolivar',   region: 'Americas', fact: "Has Angel Falls, world's highest waterfall!" },
  { name: 'Cuba',                code: 'cu', capital: 'Havana',         currency: 'Cuban Peso',           region: 'Americas', fact: 'Famous for colourful vintage cars!' },
  { name: 'Jamaica',             code: 'jm', capital: 'Kingston',       currency: 'Jamaican Dollar',      region: 'Americas', fact: 'Birthplace of reggae music!' },
  { name: 'Ecuador',             code: 'ec', capital: 'Quito',          currency: 'US Dollar',            region: 'Americas', fact: 'Straddles the equator line!' },
  { name: 'Bolivia',             code: 'bo', capital: 'Sucre',          currency: 'Bolivian Boliviano',   region: 'Americas', fact: "Has the world's highest navigable lake!", capitalQuiz: false },
  { name: 'Paraguay',            code: 'py', capital: 'Asuncion',       currency: 'Paraguayan Guarani',   region: 'Americas', fact: 'Landlocked country in South America!' },
  { name: 'Uruguay',             code: 'uy', capital: 'Montevideo',     currency: 'Uruguayan Peso',       region: 'Americas', fact: 'First country to legalise football!' },
  { name: 'Guatemala',           code: 'gt', capital: 'Guatemala City', currency: 'Guatemalan Quetzal',   region: 'Americas', fact: 'Home of ancient Maya ruins!' },
  { name: 'Costa Rica',          code: 'cr', capital: 'San Jose',       currency: 'Costa Rican Colon',    region: 'Americas', fact: 'Has no army, a peaceful country!' },
  { name: 'Panama',              code: 'pa', capital: 'Panama City',    currency: 'Panamanian Balboa',    region: 'Americas', fact: 'Has the famous Panama Canal!' },
  { name: 'Dominican Republic',  code: 'do', capital: 'Santo Domingo',  currency: 'Dominican Peso',       region: 'Americas', fact: 'Famous for merengue music!' },
  { name: 'Haiti',               code: 'ht', capital: 'Port-au-Prince', currency: 'Haitian Gourde',       region: 'Americas', fact: 'First Black republic in the world!' },
  { name: 'Trinidad and Tobago', code: 'tt', capital: 'Port of Spain',  currency: 'TT Dollar',            region: 'Americas', fact: 'Birthplace of Carnival and calypso!' },

  // ── Oceania ──
  { name: 'Australia',      code: 'au', capital: 'Canberra',      currency: 'Australian Dollar',     region: 'Oceania', fact: 'Home of kangaroos and koalas!' },
  { name: 'New Zealand',    code: 'nz', capital: 'Wellington',    currency: 'New Zealand Dollar',    region: 'Oceania', fact: 'Where The Lord of the Rings was filmed!' },
  { name: 'Fiji',           code: 'fj', capital: 'Suva',          currency: 'Fijian Dollar',         region: 'Oceania', fact: 'Beautiful island paradise in the Pacific!' },
  { name: 'Papua New Guinea',code:'pg', capital: 'Port Moresby',  currency: 'Kina',                  region: 'Oceania', fact: 'Has over 800 different languages!' },
  { name: 'Samoa',          code: 'ws', capital: 'Apia',          currency: 'Samoan Tala',           region: 'Oceania', fact: 'Famous for traditional fire knife dancing!' },
  { name: 'Tonga',          code: 'to', capital: 'Nukualofa',     currency: 'Tongan Paanga',         region: 'Oceania', fact: 'The last Polynesian kingdom!' },
  { name: 'Vanuatu',        code: 'vu', capital: 'Port Vila',     currency: 'Vanuatu Vatu',          region: 'Oceania', fact: 'Has active volcanoes you can visit!' },
  { name: 'Solomon Islands',code: 'sb', capital: 'Honiara',       currency: 'Solomon Islands Dollar',region: 'Oceania', fact: 'Has stunning coral reefs!' },
]

const REGIONS = ['All', 'Europe', 'Asia', 'Africa', 'Americas', 'Oceania']
const COUNTRY_MODES = ['Capitals', 'Flags', 'Currencies']
const CONTENT_MODES = [
  { id: 'countries', label: 'Countries' },
  { id: 'history', label: 'History' },
]

const HISTORY_EVENTS = [
  {
    id: 'giza',
    yearLabel: '2560 BCE',
    sortYear: -2560,
    title: 'The Great Pyramid of Giza was completed',
    region: 'Africa',
    place: 'Egypt',
    summary: 'Builders completed one of the oldest wonders of the world.',
    funFact: 'It stayed the tallest human-made structure for thousands of years.',
    quizEnabled: false,
  },
  {
    id: 'olympics',
    yearLabel: '776 BCE',
    sortYear: -776,
    title: 'The ancient Olympic Games began',
    region: 'Europe',
    place: 'Greece',
    summary: 'Athletes gathered in Olympia for early sports competitions.',
    funFact: 'The modern Olympic Games were inspired by these ancient games.',
    quizEnabled: false,
  },
  {
    id: 'magna-carta',
    yearLabel: '1215',
    sortYear: 1215,
    title: 'The Magna Carta was signed',
    region: 'Europe',
    place: 'England',
    summary: 'This document helped limit the power of the king.',
    funFact: 'It inspired later ideas about rights and fair laws.',
  },
  {
    id: 'printing-press',
    yearLabel: '1450',
    sortYear: 1450,
    title: 'The printing press changed how books were made',
    region: 'Europe',
    place: 'Germany',
    summary: 'Books could be made faster and shared with many more people.',
    funFact: 'This helped ideas travel across the world.',
  },
  {
    id: 'taj-mahal',
    yearLabel: '1648',
    sortYear: 1648,
    title: 'The Taj Mahal was completed',
    region: 'Asia',
    place: 'India',
    summary: 'The famous white marble monument in Agra was completed in 1648.',
    funFact: 'It is one of the most visited landmarks in the world.',
  },
  {
    id: 'usa-independence',
    yearLabel: '1776',
    sortYear: 1776,
    title: 'The United States declared independence',
    region: 'Americas',
    place: 'United States',
    summary: 'The Declaration of Independence was adopted in 1776.',
    funFact: 'Americans celebrate Independence Day on 4 July.',
  },
  {
    id: 'australia-federation',
    yearLabel: '1901',
    sortYear: 1901,
    title: 'Australia became a federation',
    region: 'Oceania',
    place: 'Australia',
    summary: "Australia's colonies joined together to form one nation.",
    funFact: 'Canberra later became the capital city.',
  },
  {
    id: 'india-independence',
    yearLabel: '1947',
    sortYear: 1947,
    title: 'India became independent',
    region: 'Asia',
    place: 'India',
    summary: 'India became independent on 15 August 1947.',
    funFact: 'People celebrate Independence Day every year on 15 August.',
  },
  {
    id: 'moon-landing',
    yearLabel: '1969',
    sortYear: 1969,
    title: 'Humans first walked on the Moon',
    region: 'Americas',
    place: 'United States',
    summary: 'Apollo 11 astronauts landed on the Moon in 1969.',
    funFact: 'Neil Armstrong said it was one small step for man.',
  },
  {
    id: 'uae-founded',
    yearLabel: '1971',
    sortYear: 1971,
    title: 'The United Arab Emirates was founded',
    region: 'Asia',
    place: 'United Arab Emirates',
    summary: 'The UAE was formed on 2 December 1971.',
    funFact: 'National Day is celebrated every year on 2 December.',
  },
  {
    id: 'berlin-wall',
    yearLabel: '1989',
    sortYear: 1989,
    title: 'The Berlin Wall fell',
    region: 'Europe',
    place: 'Germany',
    summary: 'Families and communities were reunited when the wall came down.',
    funFact: 'It became a symbol of change in Europe.',
  },
  {
    id: 'world-wide-web',
    yearLabel: '1991',
    sortYear: 1991,
    title: 'The World Wide Web opened to the public',
    region: 'Europe',
    place: 'Switzerland',
    summary: 'Tim Berners-Lee shared the web so people could access pages online.',
    funFact: 'This helped create the internet we use every day.',
  },
  {
    id: 'south-africa-election',
    yearLabel: '1994',
    sortYear: 1994,
    title: 'South Africa held its first fully democratic election',
    region: 'Africa',
    place: 'South Africa',
    summary: 'Nelson Mandela became president after the 1994 election.',
    funFact: 'It was a major moment for equality and democracy.',
  },
]

const HISTORY_TIMELINE = [...HISTORY_EVENTS].sort((a, b) => a.sortYear - b.sortYear)

function FlagImage({ code, name, size = 'md' }) {
  const [errored, setErrored] = useState(false)
  const sizeClass = size === 'lg' ? 'w-36 h-24' : size === 'sm' ? 'w-14 h-9' : 'w-20 h-14'

  if (errored) {
    return (
      <div className={`${sizeClass} rounded-lg flex items-center justify-center text-2xl`}
        style={{ background: '#e5e7eb' }}>
        🏳
      </div>
    )
  }

  return (
    <img
      src={`https://flagcdn.com/w160/${code}.png`}
      alt={`Flag of ${name}`}
      loading="lazy"
      onError={() => setErrored(true)}
      className={`${sizeClass} object-cover rounded-lg shadow-md`}
    />
  )
}

function shuffle(arr, seed) {
  const a = [...arr]
  let s = seed >>> 0
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getQuestionPool(pool, mode) {
  const eligiblePool = mode === 'Capitals'
    ? pool.filter(country => country.capitalQuiz !== false)
    : pool

  if (eligiblePool.length >= 4) return eligiblePool

  return mode === 'Capitals'
    ? COUNTRIES.filter(country => country.capitalQuiz !== false)
    : COUNTRIES
}

function makeQuestion(pool, mode) {
  const seed = (Date.now() + Math.random() * 99999) >>> 0
  const shuffled = shuffle(getQuestionPool(pool, mode), seed)
  const correct = shuffled[0]
  const distractors = shuffled.slice(1, 4)
  const options = shuffle([correct, ...distractors], (seed * 7) >>> 0)

  let question, answerKey
  if (mode === 'Capitals') {
    question = `What is the capital of ${correct.name}?`
    answerKey = 'capital'
  } else if (mode === 'Flags') {
    question = 'Which country does this flag belong to?'
    answerKey = 'name'
  } else {
    question = `What is the currency of ${correct.name}?`
    answerKey = 'currency'
  }
  return { correct, options, question, answerKey }
}

function getHistoryQuestionPool(pool) {
  const eligiblePool = pool.filter(event => event.quizEnabled !== false)

  if (eligiblePool.length >= 4) return eligiblePool

  return HISTORY_TIMELINE.filter(event => event.quizEnabled !== false)
}

function makeHistoryQuestion(pool) {
  const seed = (Date.now() + Math.random() * 99999) >>> 0
  const shuffled = shuffle(getHistoryQuestionPool(pool), seed)
  const correct = shuffled[0]
  const distractors = []

  shuffled.slice(1).forEach((event) => {
    if (event.yearLabel === correct.yearLabel || distractors.includes(event.yearLabel)) return
    distractors.push(event.yearLabel)
  })

  const options = shuffle([correct.yearLabel, ...distractors.slice(0, 3)], (seed * 7) >>> 0)

  return {
    correct,
    options,
    question: 'Which year matches this history moment?',
    answerKey: 'history',
  }
}

export default function WorldGK({ avatar, onAddStars, onBack, profileName }) {
  const theme = THEMES[avatar] || THEMES.rumi
  const { speak } = useSpeech()

  const [contentMode, setContentMode] = useState('countries')
  const [region,   setRegion]   = useState('All')
  const [inQuiz,   setInQuiz]   = useState(false)
  const [quizMode, setQuizMode] = useState('Capitals')
  const [question, setQuestion] = useState(null)
  const [chosen,   setChosen]   = useState(null)
  const [score,    setScore]    = useState(0)
  const [qNum,     setQNum]     = useState(0)
  const [done,     setDone]     = useState(false)
  const [expanded, setExpanded] = useState(null)
  const TOTAL_Q = 8

  const visibleCountries = region === 'All' ? COUNTRIES : COUNTRIES.filter(c => c.region === region)
  const visibleHistoryEvents = region === 'All'
    ? HISTORY_TIMELINE
    : HISTORY_TIMELINE.filter(event => event.region === region)

  const getCountryPool = useCallback(() =>
    visibleCountries.length >= 4 ? visibleCountries : COUNTRIES,
  [visibleCountries])

  const startQuiz = useCallback((mode) => {
    const q = mode === 'History'
      ? makeHistoryQuestion(visibleHistoryEvents)
      : makeQuestion(getCountryPool(), mode)
    setQuizMode(mode)
    setInQuiz(true)
    setScore(0)
    setQNum(0)
    setDone(false)
    setChosen(null)
    setQuestion(q)
    if (mode === 'History') {
      speak(`${q.question} ${q.correct.title}.`, { mood: 'question' })
    } else {
      speak(q.question, { mood: 'question' })
    }
  }, [getCountryPool, visibleHistoryEvents, speak])

  const handleAnswer = useCallback((opt) => {
    if (chosen) return
    setChosen(opt)
    const isHistoryQuiz = quizMode === 'History'
    const isCorrect = isHistoryQuiz ? opt === question.correct.yearLabel : opt.name === question.correct.name
    const newScore = score + (isCorrect ? 1 : 0)
    const rightAns = quizMode === 'Capitals' ? question.correct.capital
      : quizMode === 'Flags' ? question.correct.name
      : quizMode === 'Currencies' ? question.correct.currency
      : question.correct.yearLabel

    if (isCorrect) {
      speak(`Correct! ${rightAns}! Well done!`, { mood: 'celebrate' })
      confetti({ particleCount: 40, spread: 70, origin: { x: 0.5, y: 0.4 } })
    } else {
      speak(`Not quite! The answer is ${rightAns}. Keep going!`, { mood: 'instruct' })
    }

    setTimeout(() => {
      const next = qNum + 1
      if (next >= TOTAL_Q) {
        setDone(true)
        const stars = getWorldExplorerStars(newScore)
        onAddStars('worldgk', stars, { total: TOTAL_Q, correct: newScore, struggles: [] })
        speak(`Amazing ${profileName || 'explorer'}! You got ${newScore} out of ${TOTAL_Q}!`, { mood: 'celebrate' })
        confetti({ particleCount: 120, spread: 120, origin: { x: 0.5, y: 0.3 } })
      } else {
        setQNum(next)
        setChosen(null)
        const q = quizMode === 'History'
          ? makeHistoryQuestion(visibleHistoryEvents)
          : makeQuestion(getCountryPool(), quizMode)
        setQuestion(q)
        if (quizMode === 'History') {
          speak(`${q.question} ${q.correct.title}.`, { mood: 'question' })
        } else {
          speak(q.question, { mood: 'question' })
        }
      }
    }, 1600)
  }, [chosen, question, qNum, score, quizMode, getCountryPool, visibleHistoryEvents, profileName, onAddStars, speak])

  // ── Done ─────────────────────────────────────────────────────────────────
  if (inQuiz && done) {
    const stars = getWorldExplorerStars(score)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 280 }}>
          <div className="text-8xl mb-3">🌍</div>
          <h2 className="font-bubble text-3xl shimmer-text mb-2">Quiz Complete!</h2>
          <p className="font-round text-xl mb-1" style={{ color: theme.text }}>{score}/{TOTAL_Q} correct!</p>
          <div className="text-4xl my-3">{'⭐'.repeat(stars)}</div>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => { setInQuiz(false); setDone(false) }}
            className="bubble-btn px-8 py-4 text-lg mt-4"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
            Back to Explorer 🗺️
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  if (inQuiz && question) {
    const { correct, options, question: qText, answerKey } = question
    const isHistoryQuiz = quizMode === 'History'
    return (
      <div className="min-h-screen flex flex-col"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <div className="flex items-center justify-between px-4 pt-safe pb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setInQuiz(false)}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow"
            style={{ background: theme.card, color: theme.text }}>←</motion.button>
          <div className="text-center">
            <p className="font-bubble text-lg" style={{ color: theme.primary }}>{quizMode} Quiz</p>
            <p className="font-round text-xs opacity-60" style={{ color: theme.text }}>
              {qNum + 1}/{TOTAL_Q} · Score: {score}
            </p>
          </div>
          <div className="w-10" />
        </div>

        {/* Progress bar */}
        <div className="mx-4 h-2 rounded-full overflow-hidden mb-4" style={{ background: theme.secondary + '33' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ background: theme.primary, width: `${(qNum / TOTAL_Q) * 100}%` }} />
        </div>

        <div className="flex-1 flex flex-col items-center px-4 gap-4 pb-6">
          <AnimatePresence mode="wait">
            <motion.div key={isHistoryQuiz ? correct.id : correct.code}
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center gap-3 mt-2">
              {isHistoryQuiz ? (
                <div
                  className="w-full max-w-sm rounded-[28px] px-5 py-5 text-center shadow-md"
                  style={{ background: theme.card, border: `2px solid ${theme.primary}22` }}
                >
                  <p className="font-round text-xs uppercase tracking-[0.25em]" style={{ color: theme.primary }}>
                    {correct.region}
                  </p>
                  <p className="font-bubble text-2xl mt-3" style={{ color: theme.primary }}>{correct.title}</p>
                  <p className="font-round text-sm mt-2 opacity-70" style={{ color: theme.text }}>{correct.place}</p>
                </div>
              ) : (
                <>
                  <FlagImage code={correct.code} name={correct.name} size="lg" />
                  {quizMode !== 'Flags' && (
                    <p className="font-bubble text-2xl text-center" style={{ color: theme.primary }}>{correct.name}</p>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="font-round text-base text-center px-2" style={{ color: theme.text }}>{qText}</p>

          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {options.map(opt => {
              const optionKey = isHistoryQuiz ? opt : opt.name
              const isCorrect = isHistoryQuiz ? opt === correct.yearLabel : opt.name === correct.name
              const isChosen  = isHistoryQuiz ? chosen === opt : chosen?.name === opt.name
              let borderColor = 'transparent'
              let bg = theme.card
              if (chosen) {
                if (isCorrect) { bg = '#22c55e18'; borderColor = '#22c55e' }
                else if (isChosen) { bg = '#ef444418'; borderColor = '#ef4444' }
              }
              return (
                <motion.button key={optionKey} data-companion-answer={isCorrect ? 'correct' : 'wrong'}
                  whileTap={{ scale: chosen ? 1 : 0.93 }}
                  onClick={() => handleAnswer(opt)}
                  className="rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow transition-all"
                  style={{ background: bg, border: `2px solid ${borderColor}` }}>
                  {isHistoryQuiz ? (
                    <>
                      <p className="font-round text-[11px] uppercase tracking-[0.3em] opacity-60" style={{ color: theme.text }}>
                        Year
                      </p>
                      <p className="font-bubble text-lg text-center" style={{ color: theme.text }}>
                        {opt}
                      </p>
                    </>
                  ) : quizMode === 'Flags' ? (
                    <>
                      <FlagImage code={opt.code} name={opt.name} size="sm" />
                      <p className="font-round text-xs font-bold text-center" style={{ color: theme.text }}>{opt.name}</p>
                    </>
                  ) : (
                    <p className="font-round text-sm font-bold text-center" style={{ color: theme.text }}>
                      {opt[answerKey]}
                    </p>
                  )}
                  {chosen && isCorrect && <span className="text-green-500">✓</span>}
                  {chosen && isChosen && !isCorrect && <span className="text-red-500">✗</span>}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Browse / Facts ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>

      <div className="flex items-center justify-between px-4 pt-safe pb-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.card, color: theme.text }}>←</motion.button>
        <p className="font-bubble text-xl" style={{ color: theme.primary }}>🌍 World Explorer</p>
        <div className="w-10" />
      </div>

      <div className="flex gap-2 px-4 mb-3">
        {CONTENT_MODES.map(mode => (
          <motion.button key={mode.id} whileTap={{ scale: 0.93 }}
            onClick={() => {
              setContentMode(mode.id)
              setExpanded(null)
            }}
            className="flex-1 py-2 rounded-xl font-round text-xs font-bold shadow"
            style={{
              background: contentMode === mode.id ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` : theme.card,
              color: contentMode === mode.id ? '#fff' : theme.text,
              border: `1.5px solid ${contentMode === mode.id ? theme.primary : theme.secondary + '44'}`
            }}>
            {mode.label}
          </motion.button>
        ))}
      </div>

      {/* Quiz launchers */}
      {contentMode === 'countries' ? (
        <div className="flex gap-2 px-4 mb-3">
          {COUNTRY_MODES.map(m => (
          <motion.button key={m} whileTap={{ scale: 0.93 }}
            onClick={() => startQuiz(m)}
            className="flex-1 py-2 rounded-xl font-round text-xs font-bold shadow"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, color: '#fff' }}>
            {m === 'Capitals' ? '🏙️' : m === 'Flags' ? '🚩' : '💰'} {m}
          </motion.button>
        ))}
        </div>
      ) : (
        <div className="px-4 mb-3">
          <motion.button whileTap={{ scale: 0.93 }}
            onClick={() => startQuiz('History')}
            className="w-full py-3 rounded-2xl font-round text-sm font-bold shadow"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`, color: '#fff' }}>
            Timeline Quiz
          </motion.button>
        </div>
      )}

      {/* Region filter */}
      <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide">
        {REGIONS.map(r => (
          <motion.button key={r} whileTap={{ scale: 0.93 }}
            onClick={() => {
              setRegion(r)
              setExpanded(null)
            }}
            className="px-3 py-1.5 rounded-full font-round text-xs whitespace-nowrap shrink-0 shadow-sm transition-all"
            style={{
              background: region === r ? theme.primary : theme.card,
              color: region === r ? '#fff' : theme.text,
              border: `1.5px solid ${region === r ? theme.primary : theme.secondary + '44'}`
            }}>
            {r === 'All' ? '🌍 All' : r === 'Europe' ? '🇪🇺 Europe' : r === 'Asia' ? '🌏 Asia' :
              r === 'Africa' ? '🌍 Africa' : r === 'Americas' ? '🌎 Americas' : '🌊 Oceania'}
          </motion.button>
        ))}
      </div>

      <p className="font-round text-xs px-4 mb-2 opacity-60" style={{ color: theme.text }}>
        {contentMode === 'countries'
          ? `${visibleCountries.length} countries - tap to learn more`
          : `${visibleHistoryEvents.length} history moments - tap a card to hear the story`}
      </p>

      {/* Country list */}
      <div className="flex-1 px-4 pb-24 flex flex-col gap-2 overflow-y-auto scroll-ios">
        {contentMode === 'countries' ? (
          visibleCountries.map(c => {
          const isOpen = expanded === c.code
          return (
            <motion.div key={c.code} layout className="rounded-2xl shadow-md overflow-hidden"
              style={{ background: theme.card }}>
              <button
                className="w-full p-3 flex items-center gap-3 text-left"
                onClick={() => {
                  const opening = !isOpen
                  setExpanded(opening ? c.code : null)
                  if (opening) speak(`${c.name}. Capital: ${c.capital}. ${c.fact || ''}`, { mood: 'instruct' })
                }}>
                <FlagImage code={c.code} name={c.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-bubble text-base leading-tight truncate" style={{ color: theme.primary }}>{c.name}</p>
                  <p className="font-round text-xs opacity-70" style={{ color: theme.text }}>🏙️ {c.capital}</p>
                </div>
                <span className="text-xs opacity-40" style={{ color: theme.text }}>{isOpen ? '▲' : '▼'}</span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden">
                    <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: theme.secondary + '33' }}>
                      <div className="flex gap-4 flex-wrap mb-2">
                        <div>
                          <p className="font-round text-xs opacity-50 mb-0.5" style={{ color: theme.text }}>Capital</p>
                          <p className="font-bubble text-sm" style={{ color: theme.text }}>🏙️ {c.capital}</p>
                        </div>
                        <div>
                          <p className="font-round text-xs opacity-50 mb-0.5" style={{ color: theme.text }}>Currency</p>
                          <p className="font-bubble text-sm" style={{ color: theme.text }}>💰 {c.currency}</p>
                        </div>
                        <div>
                          <p className="font-round text-xs opacity-50 mb-0.5" style={{ color: theme.text }}>Region</p>
                          <p className="font-bubble text-sm" style={{ color: theme.text }}>🌐 {c.region}</p>
                        </div>
                      </div>
                      {c.fact && (
                        <p className="font-round text-xs opacity-80" style={{ color: theme.text }}>✨ {c.fact}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })
        ) : (
          visibleHistoryEvents.map(event => {
            const isOpen = expanded === event.id
            return (
              <motion.div key={event.id} layout className="rounded-2xl shadow-md overflow-hidden"
                style={{ background: theme.card }}>
                <button
                  className="w-full p-3 text-left"
                  onClick={() => {
                    const opening = !isOpen
                    setExpanded(opening ? event.id : null)
                    if (opening) {
                      speak(
                        `${event.title}. ${event.yearLabel}. ${event.summary}${event.funFact ? ` ${event.funFact}` : ''}`,
                        { mood: 'story' }
                      )
                    }
                  }}>
                  <div className="flex items-start gap-3">
                    <div
                      className="shrink-0 rounded-2xl px-3 py-2 text-center"
                      style={{ background: `${theme.primary}18`, minWidth: 88 }}
                    >
                      <p className="font-bubble text-sm" style={{ color: theme.primary }}>{event.yearLabel}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bubble text-base leading-tight" style={{ color: theme.primary }}>{event.title}</p>
                      <p className="font-round text-xs opacity-70 mt-1" style={{ color: theme.text }}>
                        {event.place} - {event.region}
                      </p>
                    </div>
                    <span className="text-xs opacity-40" style={{ color: theme.text }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: theme.secondary + '33' }}>
                        <div className="flex gap-4 flex-wrap mb-2">
                          <div>
                            <p className="font-round text-xs opacity-50 mb-0.5" style={{ color: theme.text }}>Year</p>
                            <p className="font-bubble text-sm" style={{ color: theme.text }}>{event.yearLabel}</p>
                          </div>
                          <div>
                            <p className="font-round text-xs opacity-50 mb-0.5" style={{ color: theme.text }}>Place</p>
                            <p className="font-bubble text-sm" style={{ color: theme.text }}>{event.place}</p>
                          </div>
                          <div>
                            <p className="font-round text-xs opacity-50 mb-0.5" style={{ color: theme.text }}>Region</p>
                            <p className="font-bubble text-sm" style={{ color: theme.text }}>{event.region}</p>
                          </div>
                        </div>
                        <p className="font-round text-xs opacity-80" style={{ color: theme.text }}>{event.summary}</p>
                        {event.funFact && (
                          <p className="font-round text-xs opacity-70 mt-2" style={{ color: theme.text }}>{event.funFact}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
