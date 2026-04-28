/**
 * Mapping of character names (or partial names) to their respective Disney franchises.
 * This is used to enrich card data from APIs that lack franchise information.
 */

const franchiseMap: Record<string, string> = {
  // Lilo & Stitch
  "Lilo": "Lilo & Stitch",
  "Stitch": "Lilo & Stitch",
  "Jumba Jookiba": "Lilo & Stitch",
  "Agent Pleakley": "Lilo & Stitch",
  "Gantu": "Lilo & Stitch",
  "Nani": "Lilo & Stitch",
  "David Kawena": "Lilo & Stitch",
  "Dr. Hämsterviel": "Lilo & Stitch",
  "Grand Councilwoman": "Lilo & Stitch",
  "Mrs. Hasagawa": "Lilo & Stitch",
  "Pleakley": "Lilo & Stitch",
  "Cobra Bubbles": "Lilo & Stitch",
  "Reuben": "Lilo & Stitch",
  "Pudge": "Lilo & Stitch",
  "David": "Lilo & Stitch",
  "Angel": "Lilo & Stitch",

  // The Black Cauldron
  "Taran": "The Black Cauldron",
  "Eilonwy": "The Black Cauldron",
  "Fflewddur Fflam": "The Black Cauldron",
  "Gurgi": "The Black Cauldron",
  "The Horned King": "The Black Cauldron",
  "Doli": "The Black Cauldron",
  "Adaon": "The Black Cauldron",
  "Cauldron Born": "The Black Cauldron",

  // Mickey Mouse & Friends
  "Mickey Mouse": "Mickey Mouse & Friends",
  "Minnie Mouse": "Mickey Mouse & Friends",
  "Donald Duck": "Mickey Mouse & Friends",
  "Daisy Duck": "Mickey Mouse & Friends",
  "Goofy": "Mickey Mouse & Friends",
  "Pluto": "Mickey Mouse & Friends",
  "Pete": "Mickey Mouse & Friends",
  "Scrooge McDuck": "Mickey Mouse & Friends",
  "Magica De Spell": "Mickey Mouse & Friends",
  "Gladstone Gander": "Mickey Mouse & Friends",
  "Huey": "Mickey Mouse & Friends",
  "Dewey": "Mickey Mouse & Friends",
  "Louie": "Mickey Mouse & Friends",
  "Clarabelle Cow": "Mickey Mouse & Friends",
  "Horace Horsecollar": "Mickey Mouse & Friends",
  "Clarabelle": "Mickey Mouse & Friends",

  // The Goofy Movie
  "Max Goof": "The Goofy Movie",
  "Roxanne": "The Goofy Movie",
  "Powerline": "The Goofy Movie",
  "Bobby Zimuruski": "The Goofy Movie",
  "P.J. Pete": "The Goofy Movie",
  "Stacy": "The Goofy Movie",
  "Beret Girl": "The Goofy Movie",
  "Tank": "The Goofy Movie",
  "Lester": "The Goofy Movie",
  "Lester's Posse": "The Goofy Movie",
  "Bigfoot": "The Goofy Movie",
  "Gammas": "The Goofy Movie",
  "Beavis": "The Goofy Movie",
  "Butthead": "The Goofy Movie",
  "Principal Mazur": "The Goofy Movie",
  "Gooch": "The Goofy Movie",
  "I2I": "The Goofy Movie",
  "Stand Out": "The Goofy Movie",

  //The Aristocats
  "Duchess": "The Aristocats",
  "Thomas O'Malley": "The Aristocats",
  "Marie": "The Aristocats",
  "Toulouse": "The Aristocats",
  "Berlioz": "The Aristocats",
  "Scat Cat": "The Aristocats",
  "Roquefort": "The Aristocats",
  "Edgar": "The Aristocats",
  "Frou-Frou": "The Aristocats",
  "Amelia Gabble": "The Aristocats",
  "Abigail Gabble": "The Aristocats",
  "Adelaide Bonfamille": "The Aristocats",

  // Frozen
  "Elsa": "Frozen",
  "Anna": "Frozen",
  "Olaf": "Frozen",
  "Kristoff": "Frozen",
  "Sven": "Frozen",
  "Hans": "Frozen",
  "Marshmallow": "Frozen",
  "Grand Pabbie": "Frozen",
  "Bulda": "Frozen",
  "Duke of Weselton": "Frozen",
  "Agnarr": "Frozen",
  "Iduna": "Frozen",
  "Bruni": "Frozen",

  // The Lion King
  "Simba": "The Lion King",
  "Nala": "The Lion King",
  "Mufasa": "The Lion King",
  "Scar": "The Lion King",
  "Timon": "The Lion King",
  "Pumbaa": "The Lion King",
  "Rafiki": "The Lion King",
  "Zazu": "The Lion King",
  "Shenzi": "The Lion King",
  "Banzai": "The Lion King",
  "Ed": "The Lion King",
  "Sarabi": "The Lion King",
  "Zira": "The Lion King",
  "Kovu": "The Lion King",
  "Kiara": "The Lion King",
  "Nuka": "The Lion King",

  // Aladdin
  "Aladdin": "Aladdin",
  "Jasmine": "Aladdin",
  "Genie": "Aladdin",
  "Jafar": "Aladdin",
  "Abu": "Aladdin",
  "Iago": "Aladdin",
  "Rajah": "Aladdin",
  "Sultan": "Aladdin",
  "Cave of Wonders": "Aladdin",

  // Pocahontas
  "Pocahontas": "Pocahontas",
  "John Smith": "Pocahontas",
  "Meeko": "Pocahontas",
  "Flit": "Pocahontas",
  "Grandmother Willow": "Pocahontas",
  "Governor Ratcliffe": "Pocahontas",
  "Percy": "Pocahontas",
  "Thomas": "Pocahontas",
  "Nakoma": "Pocahontas",
  "Kocoum": "Pocahontas",
  "Chief Powhatan": "Pocahontas",

  // The Little Mermaid
  "Ariel": "The Little Mermaid",
  "Sebastian": "The Little Mermaid",
  "Flounder": "The Little Mermaid",
  "King Triton": "The Little Mermaid",
  "Ursula": "The Little Mermaid",
  "Prince Eric": "The Little Mermaid",
  "Scuttle": "The Little Mermaid",
  "Flotsam": "The Little Mermaid",
  "Jetsam": "The Little Mermaid",
  "Chef Louis": "The Little Mermaid",
  "Grimsby": "The Little Mermaid",
  "Triton": "The Little Mermaid",
  "Ariel’s Grotto": "The Little Mermaid",

  // Beauty and the Beast
  "Belle": "Beauty and the Beast",
  "Beast": "Beauty and the Beast",
  "Gaston": "Beauty and the Beast",
  "Lumiere": "Beauty and the Beast",
  "Cogsworth": "Beauty and the Beast",
  "Mrs. Potts": "Beauty and the Beast",
  "Maurice": "Beauty and the Beast",
  "LeFou": "Beauty and the Beast",
  "The Wardrobe": "Beauty and the Beast",
  "Enchantress": "Beauty and the Beast",

  // Chip 'n' Dale: Rescue Rangers
  "Dale": "Chip 'n Dale: Rescue Rangers",
  "Monterey Jack": "Chip 'n Dale: Rescue Rangers",
  "Gadget Hackwrench": "Chip 'n Dale: Rescue Rangers",
  "Zipper": "Chip 'n Dale: Rescue Rangers",
  "Fat Cat": "Chip 'n Dale: Rescue Rangers",
  "Professor Nimnul": "Chip 'n Dale: Rescue Rangers",
  "Chip 'n' Dale": "Chip 'n Dale: Rescue Rangers",
  "Covington": "Chip 'n Dale: Rescue Rangers",
  "Binky": "Chip 'n Dale: Rescue Rangers",
  "Rescue Rangers": "Chip 'n Dale: Rescue Rangers",

  // Fantasia
  "Magic Broom": "Fantasia",
  "Chernabog": "Fantasia",
  "Chernabog's Followers": "Fantasia",

  // Peter Pan
  "Peter Pan": "Peter Pan",
  "Wendy Darling": "Peter Pan",
  "Tinker Bell": "Peter Pan",
  "Captain Hook": "Peter Pan",
  "Mr. Smee": "Peter Pan",
  "John Darling": "Peter Pan",
  "Michael Darling": "Peter Pan",
  "Nana": "Peter Pan",
  "Lost Boys": "Peter Pan",
  "Starkey": "Peter Pan",

  // Sleeping Beauty
  "Aurora": "Sleeping Beauty",
  "Maleficent": "Sleeping Beauty",
  "Prince Phillip": "Sleeping Beauty",
  "Flora": "Sleeping Beauty",
  "Fauna": "Sleeping Beauty",
  "Merryweather": "Sleeping Beauty",
  "King Stefan": "Sleeping Beauty",
  "King Hubert": "Sleeping Beauty",

  // Cinderella
  "Cinderella": "Cinderella",
  "Prince Charming": "Cinderella",
  "Lady Tremaine": "Cinderella",
  "Anastasia": "Cinderella",
  "Drizella": "Cinderella",
  "Fairy Godmother": "Cinderella",
  "Gus": "Cinderella",
  "Jaq": "Cinderella",
  "Lucifer": "Cinderella",
  "Grand Duke": "Cinderella",

  // Snow White
  "Snow White": "Snow White",
  "Evil Queen": "Snow White",
  "The Queen": "Snow White",
  "Doc": "Snow White",
  "Grumpy": "Snow White",
  "Happy": "Snow White",
  "Sleepy": "Snow White",
  "Bashful": "Snow White",
  "Sneezy": "Snow White",
  "Dopey": "Snow White",
  "The Prince": "Snow White",
  "Magic Mirror": "Snow White",

  // Tangled
  "Rapunzel": "Tangled",
  "Flynn Rider": "Tangled",
  "Pascal": "Tangled",
  "Maximus": "Tangled",
  "Mother Gothel": "Tangled",
  "Shorty": "Tangled",
  "Stabbington Brothers": "Tangled",
  "Arianna": "Tangled",
  "Big Nose": "Tangled",

  //The Great Mouse Detective
  "Basil": "The Great Mouse Detective",
  "Dr. Dawson": "The Great Mouse Detective",
  "Ratigan": "The Great Mouse Detective",
  "Olivia Flaversham": "The Great Mouse Detective",
  "Fidget": "The Great Mouse Detective",
  "Mrs. Judson": "The Great Mouse Detective",
  "Mayor of London": "The Great Mouse Detective",
  "Felicia": "The Great Mouse Detective",
  "Hiram Flaversham": "The Great Mouse Detective",

  // Alice in Wonderland
  "Alice": "Alice in Wonderland",
  "Mad Hatter": "Alice in Wonderland",
  "Cheshire Cat": "Alice in Wonderland",
  "Queen of Hearts": "Alice in Wonderland",
  "White Rabbit": "Alice in Wonderland",
  "Caterpillar": "Alice in Wonderland",
  "Doormouse": "Alice in Wonderland",
  "March Hare": "Alice in Wonderland",
  "Walrus": "Alice in Wonderland",
  "Carpenter": "Alice in Wonderland",
  "Card Soldiers": "Alice in Wonderland",
  "Bill the Lizard": "Alice in Wonderland",

  // Hercules
  "Hercules": "Hercules",
  "Megara": "Hercules",
  "Philoctetes": "Hercules",
  "Hades": "Hercules",
  "Pegasus": "Hercules",
  "Pain": "Hercules",
  "Panic": "Hercules",
  "Hydra": "Hercules",
  "Zeus": "Hercules",
  "Just in Time": "Hercules",
  "Cerberus": "Hercules",
  "Ares": "Hercules",
  "Arges": "Hercules",

  // Moana
  "Moana": "Moana",
  "Maui": "Moana",
  "HeiHei": "Moana",
  "Heihei": "Moana",
  "Pua": "Moana",
  "Gramma Tala": "Moana",
  "Tamatoa": "Moana",
  "Te Kā": "Moana",
  "Chief Tui": "Moana",

  // Bambi
  "Bambi": "Bambi",
  "Thumper": "Bambi",
  "Flower": "Bambi",
  "Faline": "Bambi",
  "The Great Prince of the Forest": "Bambi",
  "Friend Owl": "Bambi",
  "Man": "Bambi",

  // Big Hero 6
  "Baymax": "Big Hero 6",
  "Hiro Hamada": "Big Hero 6",
  "Honey Lemon": "Big Hero 6",
  "Wasabi": "Big Hero 6",
  "Fred": "Big Hero 6",
  "Go Go Tomago": "Big Hero 6",
  "Alistair Krei": "Big Hero 6",
  "Aunt Cass": "Big Hero 6",

  // Robin Hood
  "Robin Hood": "Robin Hood",
  "Maid Marian": "Robin Hood",
  "Little John": "Robin Hood",
  "Prince John": "Robin Hood",
  "Sheriff of Nottingham": "Robin Hood",
  "Friar Tuck": "Robin Hood",
  "Alan-a-Dale": "Robin Hood",
  "Alan-a-dale": "Robin Hood",

  // 101 Dalmatians
  "Cruella De Vil": "101 Dalmatians",
  "Pongo": "101 Dalmatians",
  "Perdita": "101 Dalmatians",
  "Lucky": "101 Dalmatians",
  "Patch": "101 Dalmatians",
  "Rolly": "101 Dalmatians",
  "Horace": "101 Dalmatians",
  "Jasper": "101 Dalmatians",
  "Sergeant Tibbs": "101 Dalmatians",
  "Anita Radcliffe": "101 Dalmatians",

  // The Jungle Book
  "Mowgli": "The Jungle Book",
  "Baloo": "The Jungle Book",
  "Bagheera": "The Jungle Book",
  "Shere Khan": "The Jungle Book",
  "King Louie": "The Jungle Book",
  "Kaa": "The Jungle Book",
  "Akela": "The Jungle Book",

  // Mulan
  "Mulan": "Mulan",
  "Mushu": "Mulan",
  "Li Shang": "Mulan",
  "Shan Yu": "Mulan",
  "Yao": "Mulan",
  "Ling": "Mulan",
  "Chien-Po": "Mulan",
  "Chi-Fu": "Mulan",

  // Wreck-It Ralph
  "Wreck-It Ralph": "Wreck-It Ralph",
  "Vanellope von Schweetz": "Wreck-It Ralph",
  "Fix-It Felix Jr.": "Wreck-It Ralph",
  "King Candy": "Wreck-It Ralph",
  "Sergeant Calhoun": "Wreck-It Ralph",
  "Adorabeezle Winterpop": "Wreck-It Ralph",
  "Calhoun": "Wreck-It Ralph",
  "Bad-Anon": "Wreck-It Ralph",
  "Candlehead": "Wreck-It Ralph",

  // Winnie the Pooh
  "Winnie the Pooh": "Winnie the Pooh",
  "Tigger": "Winnie the Pooh",
  "Piglet": "Winnie the Pooh",
  "Eeyore": "Winnie the Pooh",
  "Rabbit": "Winnie the Pooh",
  "Christopher Robin": "Winnie the Pooh",

  // Raya and the Last Dragon
  "Raya": "Raya and the Last Dragon",
  "Sisu": "Raya and the Last Dragon",
  "Atitaya": "Raya and the Last Dragon",
  "Namaari": "Raya and the Last Dragon",
  "Tuk Tuk": "Raya and the Last Dragon",
  "Boun": "Raya and the Last Dragon",
  "Tong": "Raya and the Last Dragon",
  "Chief Benja": "Raya and the Last Dragon",
  "Virana": "Raya and the Last Dragon",
  "Dang Hu": "Raya and the Last Dragon",
  "Tail": "Raya and the Last Dragon",
  "Heart": "Raya and the Last Dragon",
  "Spine": "Raya and the Last Dragon",
  "Fang": "Raya and the Last Dragon",
  "Talon": "Raya and the Last Dragon",
  "Noi": "Raya and the Last Dragon",
  "Benja": "Raya and the Last Dragon",

  //Dumbo
  "Dumbo": "Dumbo",
  "Timothy Q. Mouse": "Dumbo",
  "Mrs. Jumbo": "Dumbo",
  "The Ringmaster": "Dumbo",
  "Crows": "Dumbo",

  //The Rescuers
  "Bernard": "The Rescuers",
  "Miss Bianca": "The Rescuers",
  "Madame Medusa": "The Rescuers",
  "Orville": "The Rescuers",
  "Evinrude": "The Rescuers",
  "Morteo": "The Rescuers",
  "Brutus": "The Rescuers",

  // The Princess and the Frog
  "Tiana": "The Princess and the Frog",
  "Prince Naveen": "The Princess and the Frog",
  "Dr. Facilier": "The Princess and the Frog",
  "Louis": "The Princess and the Frog",
  "Ray": "The Princess and the Frog",
  "Eudora": "The Princess and the Frog",
  "James": "The Princess and the Frog",
  "Eli La Bouff": "The Princess and the Frog",
  "Charlotte La Bouff": "The Princess and the Frog",

  // Emperor's New Groove
  "Kuzco": "The Emperor's New Groove",
  "Pacha": "The Emperor's New Groove",
  "Yzma": "The Emperor's New Groove",
  "Kronk": "The Emperor's New Groove",
  "Tipo": "The Emperor's New Groove",
  "Chaca": "The Emperor's New Groove",
  "Bucky": "The Emperor's New Groove",
  "Chicha": "The Emperor's New Groove",

  // Treasure Planet
  "Jim Hawkins": "Treasure Planet",
  "John Silver": "Treasure Planet",
  "B.E.N.": "Treasure Planet",
  "Captain Amelia": "Treasure Planet",
  "Dr. Doppler": "Treasure Planet",
  "Morph": "Treasure Planet",
  "Billy Bones": "Treasure Planet",

  // Atlantis
  "Milo Thatch": "Atlantis",
  "Kida": "Atlantis",
  "Vinny": "Atlantis",
  "Audrey": "Atlantis",
  "Commander Rourke": "Atlantis",
  "Audrey Ramirez": "Atlantis",
  "Helga Sinclair": "Atlantis",
  "The Leviathan": "Atlantis",

  // Pinocchio
  "Pinocchio": "Pinocchio",
  "Jiminy Cricket": "Pinocchio",
  "Geppetto": "Pinocchio",
  "Blue Fairy": "Pinocchio",
  "Figaro": "Pinocchio",
  "Monstro": "Pinocchio",
  "Stromboli": "Pinocchio",
  "Lampwick": "Pinocchio",
  "Honest John": "Pinocchio",
  "Gideon": "Pinocchio",

  //Bolt
  "Bolt": "Bolt",
  "Penny": "Bolt",
  "Mittens": "Bolt",
  "Rhino": "Bolt",
  "Dr. Calico": "Bolt",
  "Bobby": "Bolt",

  // The Hunchback of Notre Dame
  "Quasimodo": "The Hunchback of Notre Dame",
  "Esmeralda": "The Hunchback of Notre Dame",
  "Frollo": "The Hunchback of Notre Dame",
  "Phoebus": "The Hunchback of Notre Dame",

  // Tarzan
  "Tarzan": "Tarzan",
  "Jane": "Tarzan",
  "Terk": "Tarzan",

  // Zootopia
  "Judy Hopps": "Zootopia",
  "Nick Wilde": "Zootopia",
  "Flash": "Zootopia",
  "Chief Bogo": "Zootopia",
  "Fangmeyer": "Zootopia",
  "Duke Weaselton": "Zootopia",
  "Mr. Big": "Zootopia",
  "Bellwether": "Zootopia",
  "Yax": "Zootopia",
  "Gazelle": "Zootopia",
  "Finnick": "Zootopia",
  "Manchas": "Zootopia",
  "Rain": "Zootopia",
  "Clawhauser": "Zootopia",

  // Toy Story
  "Woody": "Toy Story",
  "Buzz Lightyear": "Toy Story",
  "Jessie": "Toy Story",
  "Bo Peep": "Toy Story",
  "Forky": "Toy Story",
  "Rex": "Toy Story",
  "Hamm": "Toy Story",
  "Slinky Dog": "Toy Story",
  "Mr. Potato Head": "Toy Story",
  "Mrs. Potato Head": "Toy Story",
  "Aliens": "Toy Story",
  "Lotso": "Toy Story",
  "Zurg": "Toy Story",
  "Bullseye": "Toy Story",
  "Ducky": "Toy Story",
  "Bunny": "Toy Story",
  "Rc": "Toy Story",
  "Lenny": "Toy Story",
  "Alien": "Toy Story",
  "Wind-up Frog": "Toy Story",
  "Jingle Joe": "Toy Story",
  "Roller Bob": "Toy Story",
  "Hand-in-the-box": "Toy Story",
  "Babyhead": "Toy Story",
  "Bouncing Ducky": "Toy Story",
  "Sid Phillips": "Toy Story",
  "Pterodactyl Janie Doll": "Toy Story",
  "Like A Bird In The Sky": "Toy Story",

  // Toy Story Other
  "Pizza Planet": "Toy Story",
  "Andy's Room": "Toy Story",
  "Sid's Room": "Toy Story",
  "Al's Toy Barn": "Toy Story",
  "You've Got a Friend in Me": "Toy Story",
  "Strange Things": "Toy Story",
  "When She Loved Me": "Toy Story",
  "Buzz's Arm": "Toy Story",
  "The Claw": "Toy Story",

  // The Incredibles
  "Mr. Incredible": "The Incredibles",
  "Mrs. Incredible": "The Incredibles",
  "Elastigirl": "The Incredibles",
  "Violet Parr": "The Incredibles",
  "Dash Parr": "The Incredibles",
  "Jack-jack Parr": "The Incredibles",
  "Frozone": "The Incredibles",
  "Syndrome": "The Incredibles",
  "Edna Mode": "The Incredibles",
  "Mirage": "The Incredibles",

  // Encanto
  "Mirabel": "Encanto",
  "Bruno": "Encanto",
  "Isabela": "Encanto",
  "Luisa": "Encanto",
  "Antonio's Jaguar": "Encanto",

  // Encanto Other
  "This Growing Pressure": "Encanto",
  "Metamorphosis": "Encanto",
  "What Else Can I Do?": "Encanto",
  "The Family's Scattered": "Encanto",

  // Brave
  "Merida": "Brave",
  "Angus": "Brave",
  "Queen Elinor": "Brave",
  "King Fergus": "Brave",
  "Mor’du": "Brave",
  "Will O' The Wisp": "Brave",
  "Hamish, Hubert & Harris": "Brave",
  "Elinor": "Brave",
  "Young Macguffin": "Brave",

  //Brave Other
  "The Legend of the Bear": "Brave",
  "Dunbroch Family Tapestry": "Brave",
  "Ring of Stones": "Brave",
  "Touch The Sky": "Brave",

  // DuckTales
  "Webby Vanderquack": "DuckTales",
  "Bentley Buzzard": "DuckTales",
  "Beagle Boys": "DuckTales",
  "Black Heron": "DuckTales",
  "Gosalyn Mallard": "DuckTales",

  // TaleSpin
  "Kit Cloudkicker": "TaleSpin",
  "Don Karnage": "TaleSpin",

  // Sword in the Stone
  "Arthur": "The Sword in the Stone",
  "Merlin": "The Sword in the Stone",
  "Madam Mim": "The Sword in the Stone",
  "Archimedes": "The Sword in the Stone",

  // The Fox and the Hound
  "Tod": "The Fox and the Hound",
  "Copper": "The Fox and the Hound",
  "Big Mama": "The Fox and the Hound",
  "Amos Slade": "The Fox and the Hound",
  "Chief": "The Fox and the Hound",
  "Widow Tweed": "The Fox and the Hound",
  "Boomer": "The Fox and the Hound",

  // Gargoyles
  "Goliath": "Gargoyles",
  "Elisa Maza": "Gargoyles",
  "Demona": "Gargoyles",
  "Angela": "Gargoyles",
  "Brooklyn": "Gargoyles",
  "Broadway": "Gargoyles",
  "Lexington": "Gargoyles",
  "Hudson": "Gargoyles",
  "Bronx": "Gargoyles",
  "Xanatos": "Gargoyles",

};

// Special cases for partial matches or complex names
const partialMatches: Record<string, string> = {
  "Seven Dwarfs": "Snow White",
  "Dalmatian": "101 Dalmatians",
  "Madrigal": "Encanto",
  "Musketeer": "Mickey Mouse & Friends",
  "Duck": "Mickey Mouse & Friends",
  "Mim": "The Sword in the Stone",
  "Merlin": "The Sword in the Stone",
  "Madam Mim": "The Sword in the Stone",
  "Ursula": "The Little Mermaid",
  "Maleficent": "Sleeping Beauty",
  "Jafar": "Aladdin",
  "Scar": "The Lion King",
  "Hades": "Hercules",
  "Chernabog": "Fantasia",
  "Mickey Mouse": "Mickey Mouse & Friends",
  "Stitch": "Lilo & Stitch",
};

/**
 * Heuristic function to determine franchise from card name and metadata
 */
export function getFranchise(fullName: string): string {
  const parts = fullName.split(" - ");
  const charName = parts[0].trim();

  // 1. Disambiguation (Specific collisions)

  // Handle the "Chip" character name collision (Rescue Rangers vs Beauty and the Beast)
  // We check that the character name is specifically "Chip" or the pair "Chip 'n' Dale"
  if (charName === "Chip" || charName === "Chip 'n' Dale") {
    const beautySubtitles = ["Teacup", "Gentle Soul", "Friend Indeed", "Maurice"];
    const rescueRangerSubtitles = ["Ranger", "Leader", "Quick Thinker", "Recovery", "Rescue"];

    if (beautySubtitles.some(s => fullName.includes(s))) return "Beauty and the Beast";
    if (rescueRangerSubtitles.some(s => fullName.includes(s))) return "Chip 'n Dale: Rescue Rangers";

    // Default for the character "Chip"
    return "Chip 'n Dale: Rescue Rangers";
  }

  // 2. Direct match on full name
  if (franchiseMap[fullName]) return franchiseMap[fullName];

  // 3. Exact match on character name (first part of "Name - Subtitle")
  if (franchiseMap[charName]) return franchiseMap[charName];

  // 4. Partial matches
  for (const [key, value] of Object.entries(partialMatches)) {
    if (fullName.includes(key)) return value;
  }

  // 5. Default
  return "";
}
