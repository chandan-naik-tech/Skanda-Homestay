/**
 * ============================================================================
 *  EDIT ME: all the words, numbers and photos on the website live in this file.
 * ============================================================================
 *  - There is no server and no dashboard. To change something, edit it here,
 *    then run the website again (or deploy again) and refresh.
 *  - Anything left as '' (empty), null or [] is simply not shown.
 *  - Nothing here is invented. Facts the owner supplied are filled in; everything
 *    else is left blank on purpose.
 *  - Photos: put your files in frontend/public/photos and point to them here,
 *    for example '/photos/bedroom.jpg'. Files in /public/placeholders are SAMPLE
 *    ILLUSTRATIONS, not photos of the property.
 */
export const defaultContent = {
  settings: {
    // false = hide anything that has not been filled in (the normal, public setting)
    // true  = show dashed "Add ..." markers for missing details (handy while preparing)
    showPlaceholders: false,
    // true = logo launch animation, logo flash when changing sections, and text animations. false = a calm site with none of them.
    // (Visitors whose device is set to "reduce motion" never see them either.)
    animations: true,
  },

  brand: {
    name: 'Skanda Homestay', // the homestay name (shown everywhere, also in enquiry emails)
    tagline: 'Comfortable 1BHK Stay in Kumta',
    description: 'A peaceful, well-maintained comfortable 1BHK homestay in Kumta, ideal for families and travellers.',
    logoImage: '', // optional: a logo image of your own (for example '/photos/logo.png') replaces the built-in house-and-wave logo
  },

  hero: {
    headline: 'Skanda Homestay – Kumta',
    subtext: 'Discover a comfortable, welcoming place to stay, where every journey feels a little more like home.',
    image: '/photos/home-front.jpg', // the house, from the front (the owner's own photo)
    imageAlt: 'The house seen from the front, with a car parked under the carport and coconut palms around it',
  },

  contact: {
    phone: '99457 37385', // the owner's contact number (country code 91 is added for the Call link)
    whatsapp: '99457 37385', // enables the WhatsApp buttons (country code 91 is added automatically)
    email: 'Samarthanaik55@gmail.com', // the Send an Email buttons open the visitor's mail app addressed to this
    formEndpoint: '', // optional: your own Formspree / Web3Forms https:// address. Empty = enquiries go to `email` through FormSubmit.co
    hours: '24/7 Available', // shown as "Preferred contact hours" in the Contact section
    defaultCountryCode: '91', // added when a number is typed without one
    instagram: '', // full https:// links; leave empty to hide
    facebook: '',
    youtube: '',
  },

  about: {
    heading: 'A Little Place to Feel at Home.',
    imageA: '/photos/bedroom-1.jpg',
    imageAAlt: 'Bedroom with a floor mattress, pillows, and a barred window with a purple curtain',
    imageB: '/photos/bathroom-1.jpg',
    imageBAlt: 'Bathroom with white and blue tiles, a toilet, a wall-mounted water heater and a shower',
  },

  property: {
    lead: 'A peaceful and well-maintained comfortable 1BHK stay, ideal for families and travellers.',
    closing:
      'Whether you are visiting for a holiday, exploring nearby attractions, traveling for work, or simply looking for a peaceful place to relax, our homestay is designed to offer a comfortable and welcoming experience.',
    accommodation: 'Comfortable 1BHK Stay',
    bedrooms: '2 bedrooms', // updated to 2 bedrooms
    livingArea: 'Well maintained, with good space available',
    kitchen: 'Basic use only: heating milk or water, tea and coffee',
    bathroom: 'Clean and hygienic',
    maxGuests: null, // a number, e.g. 4. Also limits what visitors can enquire for.
    guestsLabel: 'Families and Travellers', // Target visitors shown on the home page
    maxRooms: 1, // this is one apartment, so visitors can enquire for 1
    parking: 'Available',
    wifi: 'Mobile networks available (Jio, Airtel, BSNL, etc.)',
    // icon options: family, pets, smoking, alcohol, parties, kitchen, power, info
    houseRules: [
      { icon: 'family', text: 'Suitable for families and travellers' },
      { icon: 'pets', text: 'No pets' },
      { icon: 'smoking', text: 'No smoking' },
      { icon: 'alcohol', text: 'No alcohol' },
      { icon: 'parties', text: 'No parties' },
      { icon: 'kitchen', text: 'Kitchen for basic kids-related use only: heating milk or water, tea and coffee' },
      { icon: 'power', text: 'No power backup. This locality generally does not experience power cuts.' },
    ],
  },

  pricing: {
    pricePerNight: null, // a number, e.g. 2500. Nothing is shown until you set it.
    currency: '₹',
    cleaningFee: null,
    otherCharges: [], // e.g. [{ label: 'Extra guest, per night', amount: 500 }]
    cancellationPolicy: '',
  },

  /*
   * Amenities. ONLY entries with enabled: true appear on the website.
   * Turn one on only when it is really available at the property.
   * icon options: bed, bath, kitchen, wifi, ac, fan, tv, fridge, washing, parking,
   * hotwater, dining, sofa, home, shield, sparkles, heart, coffee, baby, key,
   * plug, shirt, lamp, monitor, wind, palm
   */
  amenities: [
    { id: 'bed', icon: 'bed', title: 'Comfortable bed', text: '', enabled: false },
    { id: 'bath', icon: 'bath', title: 'Private bathroom', text: '', enabled: false },
    { id: 'kitchen', icon: 'kitchen', title: 'Kitchen access', text: 'Basic use only: heating milk or water, tea and coffee.', enabled: true },
    { id: 'wifi', icon: 'wifi', title: 'Wi-Fi', text: '', enabled: false },
    { id: 'ac', icon: 'ac', title: 'Air conditioning', text: '', enabled: false },
    { id: 'fan', icon: 'fan', title: 'Fan', text: '', enabled: false },
    { id: 'tv', icon: 'tv', title: 'Television', text: '', enabled: false },
    { id: 'fridge', icon: 'fridge', title: 'Refrigerator', text: '', enabled: false },
    { id: 'washing', icon: 'washing', title: 'Washing machine', text: '', enabled: false },
    { id: 'parking', icon: 'parking', title: 'Parking', text: '', enabled: false },
    { id: 'hotwater', icon: 'hotwater', title: 'Hot water', text: '', enabled: false },
    { id: 'dining', icon: 'dining', title: 'Dining area', text: '', enabled: false },
  ],

  /*
   * Gallery. Categories used by the filter: Bedroom, Kitchen, Bathroom, Exterior, Nearby.
   * Images under /placeholders are SAMPLE ILLUSTRATIONS; the photos under /photos are the owner's own.
   * `thumb` is an optional smaller version used in the grid; `width`/`height` stop the page jumping while photos load (uploads fill these in).
   */
  gallery: [
    { id: 'g-bedroom-1', src: '/photos/bedroom-1.jpg', thumb: '', width: 711, height: 504, alt: 'Bedroom with a floor mattress, pillows, and a barred window with a purple curtain', category: 'Bedroom' },
    { id: 'g-bedroom-2', src: '/photos/bedroom-2.jpg', thumb: '', width: 689, height: 955, alt: 'Room with a floor mattress, yellow walls and a wooden door, with a kitchen counter at the side', category: 'Bedroom' },
    { id: 'g-kitchen-1', src: '/photos/kitchen-1.jpg', thumb: '', width: 738, height: 544, alt: 'Kitchen corner with a black granite counter, brown cabinets, a sink and a tiled wall', category: 'Kitchen' },
    { id: 'g-bathroom-1', src: '/photos/bathroom-1.jpg', thumb: '', width: 960, height: 1280, alt: 'Bathroom with white and blue tiles, a toilet, a wall-mounted water heater, a shower and a wooden door', category: 'Bathroom' },
    { id: 'g-exterior-1', src: '/photos/home-front.jpg', thumb: '/photos/home-front-md.jpg', width: 1600, height: 1197, alt: 'The house seen from the front, with a car parked under the carport and coconut palms around it', category: 'Exterior' },
    { id: 'g-nearby-1', src: '/photos/gokarna-trek.jpg', thumb: '', width: 500, height: 889, alt: 'Gokarna beach trek: a cliff-top path above the sea, from a travel guide graphic', category: 'Nearby' },
    { id: 'g-nearby-2', src: '/photos/vannalli-beach.jpg', thumb: '', width: 335, height: 597, alt: 'Vannalli Beach: green cliff-top meadow looking out over rocks and the sea', category: 'Nearby' },
    { id: 'g-nearby-3', src: '/photos/murdeshwar-shiva.jpg', thumb: '', width: 387, height: 516, alt: 'Large seated Shiva statue by the sea at Murdeshwar, seen from above', category: 'Nearby' },
    { id: 'g-nearby-4', src: '/photos/gunavanteshwara-temple.jpg', thumb: '', width: 480, height: 640, alt: 'Sri Gunavanteshwara Temple with a decorated entrance and a tall flower-decked pillar', category: 'Nearby' },
    { id: 'g-nearby-5', src: '/photos/idagunji-temple.jpg', thumb: '', width: 387, height: 516, alt: 'Shri Idagunji Ganapathi Temple: the carved gateway and signboard', category: 'Nearby' },
    { id: 'g-nearby-6', src: '/photos/temple-gate.jpg', thumb: '', width: 387, height: 516, alt: 'Colourful temple entrance gate with pillars, framed by palm trees', category: 'Nearby' },
    { id: 'g-nearby-7', src: '/photos/yana-caves.jpg', thumb: '', width: 387, height: 516, alt: 'Yana Caves: a tall dark limestone rock formation rising above the trees', category: 'Nearby' },
    { id: 'g-nearby-8', src: '/photos/temple-gopura.jpg', thumb: '', width: 1200, height: 900, alt: 'A golden-yellow temple gateway tower covered in carved figures, against a blue sky', category: 'Nearby' },
    { id: 'g-nearby-9', src: '/photos/vishnu-teertha.jpg', thumb: '', width: 335, height: 597, alt: 'Vishnu Teertha, Kumta: aerial view of a temple pond and red-roofed shrine surrounded by green forest', category: 'Nearby' },
    { id: 'g-nearby-10', src: '/photos/mirjan-fort.jpg', thumb: '', width: 1280, height: 720, alt: 'Mirjan Fort: a moss-covered laterite stone bastion with steps and walls, under a blue sky', category: 'Nearby' },
  ],

  story: {
    heading: 'More Than Just a Place to Stay.',
    subheading: "Every Home Has a Story. Here's Mine.",
    // Draft copy. Edit it so it is true to your own story.
    paragraphs: [
      'Every memorable journey deserves a comfortable place to return to.',
      'I wanted to turn my available living space into something meaningful, a place where travelers could relax, feel comfortable, and enjoy their time away from home.',
      'That idea became the beginning of this homestay.',
      'My goal is simple: to offer guests a welcoming space, a comfortable stay, and a personal touch that makes their visit memorable.',
      'Whether you are traveling for a holiday, visiting family, exploring the area, or passing through on a longer journey, I hope this place gives you a little comfort and a feeling of home.',
      'I look forward to welcoming guests from different places and helping them make wonderful memories during their stay.',
    ],
    image: '/placeholders/story.svg',
    // A short three-step story. Keep it to what is true.
    timeline: [
      { title: 'The idea', text: 'A vacant 1BHK and a thought: it could be a welcoming place for travelers.' },
      { title: 'The space', text: 'A peaceful, well-maintained home, kept simple and comfortable for families.' },
      { title: 'The welcome', text: 'A personal touch for every guest, and help with anything about their stay.' },
    ],
  },

  owner: {
    name: 'Samartha G. Naik', // the owner's full name
    photo: '/photos/owner.jpg', // the owner's own portrait (cropped 4:5)
    intro: '',
    hometown: 'Hegde, Kumta (U.K)',
    languages: 'Kannada, English, Hindi',
    philosophy: 'A good place to stay should offer more than just a room: comfort, peace of mind and a welcoming atmosphere.',
    background:
      'I believe a great stay is more than just a place to sleep—it’s about feeling at home, finding peace, and creating memories. At Skanda Homestay, I strive to offer warm hospitality, thoughtful comfort, and a welcoming space where every guest feels special.',
    // Sample text from your brief. Edit it so it sounds like you.
    welcome:
      "Hello and welcome!\n\nI'm the host behind this homestay. I believe a good place to stay should offer more than just a room — it should provide comfort, peace of mind, and a welcoming atmosphere.\n\nI'm happy to help guests with their stay-related questions and make their visit as comfortable as possible.\n\nI look forward to welcoming you!",
  },

  location: {
    general: 'Kumta, Uttara Kannada, Karnataka', // the locality and town. Do not add a full address unless you want it public.
    // The map shows the area (Hegde, Kumta). For the exact house, open Google Maps > your place > Share > "Embed a map",
    // copy the src="..." link into mapEmbedUrl, and the normal Share link into directionsUrl.
    // Pin on the owner's exact spot (coordinates taken from the owner's Google Maps embed).
    mapEmbedUrl: 'https://www.google.com/maps?q=14.4558158,74.4183203&z=16&output=embed',
    // The owner's Street View embed, if you prefer it: https://www.google.com/maps/embed?pb=!4v1793384600171!6m8!1m7!1ssntbV7m4Je1OBdpXXkG1fA!2m2!1d14.45581580465077!2d74.4183203392351!3f167.84!4f-28.380000000000003!5f0.7820865974627469
    directionsUrl: 'https://maps.app.goo.gl/wQhGuuhNKkqXbBnw5', // enables "Get Directions"
    // Approximate drive times given by the owner. Write times like "30 minutes".
    // emoji and note are optional decorations for the card in the top section (leave them out for a plain row).
    driveTimes: [
      { place: 'Honnavar', time: '15 minutes', emoji: '🌴', note: 'Coastal town & backwaters' },
      { place: 'Gokarna', time: '30 minutes', emoji: '🏖️', note: 'Beaches & temple town' },
      { place: 'Murdeshwar', time: '40 minutes', emoji: '🛕', note: 'Shiva temple by the sea' },
    ],
    attractions: [], // e.g. [{ name: 'Om Beach', distance: '10 km', note: 'Quiet beach' }]
    station: '', // e.g. "Honnavar railway station, about 8 km"
    busStand: '',
    airport: '',
    restaurants: '',
  },

  // Add ONLY genuine guest reviews here. Never invent any.
  reviews: [], // e.g. [{ id: 'r1', name: 'A. Sharma', text: '...', rating: 5, stay: 'March 2027' }]

  booking: {
    title: 'Contact for Reservations',
    cta: 'Contact for Reservations',
  },
};
