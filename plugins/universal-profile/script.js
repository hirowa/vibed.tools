// Zodiac & Astrology Plugin Script
class ZodiacAstrologyPlugin {
  constructor() {
    // Use the Flowbite datepicker input from the UI
    this.birthdateInput = document.getElementById("birthdate");

    this.genderSelect = document.getElementById("gender");
    this.calculateButton = document.getElementById("calculate-btn");
    this.resultsContainer = document.getElementById("results");
    this.initialMessage = document.getElementById("initial-message");
    this.profileDate = document.getElementById("profile-date");

    // Result elements
    this.westernZodiac = document.getElementById("western-zodiac");
    this.chineseZodiac = document.getElementById("chinese-zodiac");
    this.nativeAmericanZodiac = document.getElementById(
      "native-american-zodiac"
    );
    this.mayanZodiac = document.getElementById("mayan-zodiac");
    this.egyptianZodiac = document.getElementById("egyptian-zodiac");
    this.celticTree = document.getElementById("celtic-tree");
    this.birthstone = document.getElementById("birthstone");
    this.lifePath = document.getElementById("life-path");
    this.tarotCards = document.getElementById("tarot-cards");
    this.kuaNumber = document.getElementById("kua-number");
    this.kuaGroup = document.getElementById("kua-group");
    this.auspiciousDirections = document.getElementById(
      "auspicious-directions"
    );
    this.inauspiciousDirections = document.getElementById(
      "inauspicious-directions"
    );

    // Initialize the plugin
    this.init();
  }

  init() {
    // Set up the calculate button event listener
    this.calculateButton.addEventListener("click", () => {
      this.calculateResults();
    });

    // Set a default date (today) in the datepicker input in YYYY-MM-DD format
    const today = new Date();
    this.birthdateInput.value = today.toISOString().split("T")[0];
  }

  calculateResults() {
    const birthdateStr = this.birthdateInput.value;
    const genderValue = this.genderSelect.value;

    if (!birthdateStr || !genderValue) {
      alert("Please enter a valid birthdate and select a gender.");
      return;
    }

    // Parse the birthdate string (format: YYYY-MM-DD)
    const parts = birthdateStr.split("-");
    if (parts.length !== 3) {
      alert("Please use the format YYYY-MM-DD for the birthdate.");
      return;
    }
    const [year, month, day] = parts.map(Number);
    const birthdate = new Date(year, month - 1, day);

    // Validate the date
    if (
      isNaN(birthdate.getTime()) ||
      birthdate.getFullYear() !== year ||
      birthdate.getMonth() !== month - 1 ||
      birthdate.getDate() !== day
    ) {
      alert("Please enter a valid date.");
      return;
    }

    // Calculate all zodiac and astrological information using the formulas
    const westernZodiac = this.getZodiacSign(birthdate);
    const chineseZodiac = this.getChineseZodiac(birthdate.getFullYear());
    const nativeAmericanZodiac = this.getNativeAmericanZodiac(birthdate);
    const mayanZodiac = this.getMayanZodiacSign(birthdate);
    const egyptianZodiac = this.getEgyptianZodiacSign(birthdate);
    const celticTree = this.getCelticTreeSign(birthdate);
    const birthstoneValue = this.getBirthstone(birthdate.getMonth() + 1);
    const lifePathNumber = this.calculateLifePathNumber(birthdate);
    const tarotBirthCards = this.calculateTarotBirthCards(birthdate);
    const kuaNumberValue = this.calculateKuaNumber(
      birthdate.getFullYear(),
      genderValue
    );
    const { group, auspicious, inauspicious } =
      this.getKuaGroupAndDirections(kuaNumberValue);

    // Display the results on the UI
    this.displayResults({
      birthdate,
      westernZodiac,
      chineseZodiac,
      nativeAmericanZodiac,
      mayanZodiac,
      egyptianZodiac,
      celticTree,
      birthstoneValue,
      lifePathNumber,
      tarotBirthCards,
      kuaNumberValue,
      group,
      auspicious,
      inauspicious,
    });
  }

  // Helper method to get image paths using Flowbite components
  getImagePath(type, value) {
    const basePath = "assets/img";
    const normalizeForFilename = (str) =>
      str
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^\w-]/g, "");

    switch (type) {
      case "western-zodiac":
        return `${basePath}/western_zodiac/${normalizeForFilename(value)}.svg`;
      case "chinese-zodiac":
        return `${basePath}/chinese_zodiac/${normalizeForFilename(value)}.svg`;
      case "native-american-zodiac":
        return `${basePath}/native_american_zodiac/${normalizeForFilename(
          value
        )}.svg`;
      case "mayan-zodiac":
        const mayanMatch = value.match(/\(([^)]+)\)$/);
        if (mayanMatch && mayanMatch[1]) {
          return `${basePath}/mayan_zodiac/${normalizeForFilename(
            mayanMatch[1]
          )}.svg`;
        }
        return "";
      case "egyptian-zodiac":
        let egyptianValue = value;
        if (value === "Thoth") {
          egyptianValue = "Toth";
        } else if (value === "Anubis") {
          egyptianValue = "Annubis";
        }
        return `${basePath}/egyptian_zodiac/${normalizeForFilename(
          egyptianValue
        )}.svg`;
      case "celtic-tree":
        return `${basePath}/celtic_tree/${normalizeForFilename(
          value
        )}_-_the_${this.getCelticTreeTitle(value)}.svg`;
      case "birthstone":
        return `${basePath}/birthstones/${normalizeForFilename(value)}.svg`;
      case "life-path":
        return `${basePath}/life_path/${value}.svg`;
      case "tarot-cards":
        const firstCard = value[0];
        const tarotMap = {
          "The Fool": "",
          "The Magician": "wheel_of_fortune_-_magician",
          "The High Priestess": "judgement_-_high_priestess",
          "The Empress": "world_-_empress",
          "The Emperor": "death_-_emperor",
          "The Hierophant": "temperance_-_hierophant",
          "The Lovers": "devil_-_lovers",
          "The Chariot": "tower_-_chariot",
          Strength: "star_-_strength",
          "The Hermit": "moon_-_hermit",
          "Wheel of Fortune": "sun_-_wheel_-_magician",
          Justice: "justice_-_high_priestess",
          "The Hanged Man": "hanged_man_-_empress",
          Death: "death_-_emperor",
          Temperance: "temperance_-_hierophant",
          "The Devil": "devil_-_lovers",
          "The Tower": "tower_-_chariot",
          "The Star": "star_-_strength",
          "The Moon": "moon_-_hermit",
          "The Sun": "sun_-_wheel_-_magician",
          Judgement: "judgement_-_high_priestess",
          "The World": "world_-_empress",
        };
        if (tarotMap[firstCard]) {
          return `${basePath}/tarot_cards/${tarotMap[firstCard]}.svg`;
        }
        return "";
      case "kua-number":
        return `${basePath}/kua_number/${value}.svg`;
      default:
        return "";
    }
  }

  getCelticTreeTitle(tree) {
    const titles = {
      Birch: "achiever",
      Rowan: "thinker",
      Ash: "enchanter",
      Alder: "trailblazer",
      Willow: "observer",
      Hawthorn: "illusionist",
      Oak: "stabilizer",
      Holly: "ruler",
      Hazel: "knower",
      Vine: "equalizer",
      Ivy: "survivor",
      Reed: "inquisitor",
      Elder: "seeker",
    };
    return titles[tree] || "";
  }

  displayResults(results) {
    // Format the date for display (e.g., Monday, January 1, 2025)
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = results.birthdate.toLocaleDateString(
      undefined,
      options
    );
    this.profileDate.textContent = `Birthdate: ${formattedDate}`;

    // Update text fields for each calculated result
    this.westernZodiac.textContent = results.westernZodiac;
    this.chineseZodiac.textContent = results.chineseZodiac;
    this.nativeAmericanZodiac.textContent = results.nativeAmericanZodiac;
    this.mayanZodiac.textContent = results.mayanZodiac;
    this.egyptianZodiac.textContent = results.egyptianZodiac;
    this.celticTree.textContent = results.celticTree;
    this.birthstone.textContent = results.birthstoneValue;
    this.lifePath.textContent = results.lifePathNumber;
    this.tarotCards.textContent = results.tarotBirthCards.join(", ");
    this.kuaNumber.textContent = results.kuaNumberValue;
    this.kuaGroup.textContent = results.group;
    this.auspiciousDirections.textContent = results.auspicious.join(", ");
    this.inauspiciousDirections.textContent = results.inauspicious.join(", ");

    // Update images (assuming the image folder structure is in place)
    document.getElementById("western-zodiac-img").src = this.getImagePath(
      "western-zodiac",
      results.westernZodiac
    );
    document.getElementById("chinese-zodiac-img").src = this.getImagePath(
      "chinese-zodiac",
      results.chineseZodiac
    );
    document.getElementById("native-american-zodiac-img").src =
      this.getImagePath("native-american-zodiac", results.nativeAmericanZodiac);
    document.getElementById("mayan-zodiac-img").src = this.getImagePath(
      "mayan-zodiac",
      results.mayanZodiac
    );
    document.getElementById("egyptian-zodiac-img").src = this.getImagePath(
      "egyptian-zodiac",
      results.egyptianZodiac
    );
    document.getElementById("celtic-tree-img").src = this.getImagePath(
      "celtic-tree",
      results.celticTree
    );
    document.getElementById("birthstone-img").src = this.getImagePath(
      "birthstone",
      results.birthstoneValue
    );
    document.getElementById("life-path-img").src = this.getImagePath(
      "life-path",
      results.lifePathNumber
    );
    document.getElementById("tarot-cards-img").src = this.getImagePath(
      "tarot-cards",
      results.tarotBirthCards
    );
    document.getElementById("kua-number-img").src = this.getImagePath(
      "kua-number",
      results.kuaNumberValue
    );

    // Show the results container and hide the initial welcome message
    this.resultsContainer.classList.remove("hidden");
    this.initialMessage.classList.add("hidden");
  }

  // 1. Western Zodiac Sign
  getZodiacSign(birthdate) {
    const zodiacSigns = [
      {
        name: "Capricorn",
        startMonth: 12,
        startDay: 22,
        endMonth: 1,
        endDay: 19,
      },
      {
        name: "Aquarius",
        startMonth: 1,
        startDay: 20,
        endMonth: 2,
        endDay: 18,
      },
      { name: "Pisces", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
      { name: "Aries", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
      { name: "Taurus", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
      { name: "Gemini", startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
      { name: "Cancer", startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
      { name: "Leo", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
      { name: "Virgo", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
      { name: "Libra", startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
      {
        name: "Scorpio",
        startMonth: 10,
        startDay: 23,
        endMonth: 11,
        endDay: 21,
      },
      {
        name: "Sagittarius",
        startMonth: 11,
        startDay: 22,
        endMonth: 12,
        endDay: 21,
      },
    ];

    const month = birthdate.getMonth() + 1;
    const day = birthdate.getDate();

    for (const sign of zodiacSigns) {
      if (
        (month === sign.startMonth && day >= sign.startDay) ||
        (month === sign.endMonth && day <= sign.endDay)
      ) {
        return sign.name;
      }
    }
    return "Unknown";
  }

  // 2. Chinese Zodiac Animal
  getChineseZodiac(year) {
    const animals = [
      "Rat",
      "Ox",
      "Tiger",
      "Rabbit",
      "Dragon",
      "Snake",
      "Horse",
      "Goat",
      "Monkey",
      "Rooster",
      "Dog",
      "Pig",
    ];
    return animals[(year - 1900) % 12];
  }

  // 3. Native American Zodiac Sign
  getNativeAmericanZodiac(birthdate) {
    const zodiacSigns = [
      { name: "Otter", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
      { name: "Wolf", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
      { name: "Falcon", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
      { name: "Beaver", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
      { name: "Deer", startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
      {
        name: "Woodpecker",
        startMonth: 6,
        startDay: 21,
        endMonth: 7,
        endDay: 21,
      },
      { name: "Salmon", startMonth: 7, startDay: 22, endMonth: 8, endDay: 21 },
      { name: "Bear", startMonth: 8, startDay: 22, endMonth: 9, endDay: 21 },
      { name: "Raven", startMonth: 9, startDay: 22, endMonth: 10, endDay: 22 },
      { name: "Snake", startMonth: 10, startDay: 23, endMonth: 11, endDay: 22 },
      { name: "Owl", startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
      { name: "Goose", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    ];

    const month = birthdate.getMonth() + 1;
    const day = birthdate.getDate();

    for (const sign of zodiacSigns) {
      if (
        (month === sign.startMonth && day >= sign.startDay) ||
        (month === sign.endMonth && day <= sign.endDay)
      ) {
        return sign.name;
      }
    }
    return "Unknown";
  }

  // 4. Mayan Zodiac Sign
  floorDiv(numerator, denominator) {
    return Math.floor(numerator / denominator);
  }

  getMayanZodiacSign(birthdate) {
    const dayNames = [
      "Imix",
      "Ik'",
      "Ak'b'al",
      "K'an",
      "Chikchan",
      "Kimi",
      "Manik'",
      "Lamat",
      "Muluk",
      "Ok",
      "Chuwen",
      "Eb'",
      "B'en",
      "Ix",
      "Men",
      "K'ib",
      "Kab'an",
      "Etz'nab'",
      "Kawak",
      "Ajaw",
    ];

    const englishMeanings = {
      Imix: "Crocodile",
      "Ik'": "Wind",
      "Ak'b'al": "Night",
      "K'an": "Seed",
      Chikchan: "Snake",
      Kimi: "Death",
      "Manik'": "Deer",
      Lamat: "Rabbit",
      Muluk: "Water",
      Ok: "Dog",
      Chuwen: "Monkey",
      "Eb'": "Road",
      "B'en": "Reed",
      Ix: "Jaguar",
      Men: "Eagle",
      "K'ib": "Vulture",
      "Kab'an": "Earth",
      "Etz'nab'": "Flint",
      Kawak: "Storm",
      Ajaw: "Sun",
    };

    const y = birthdate.getUTCFullYear();
    const m = birthdate.getUTCMonth() + 1; // JavaScript months are 0-indexed
    const d = birthdate.getUTCDate();

    const a = this.floorDiv(14 - m, 12);
    const yAdj = y + 4800 - a;
    const mAdj = m + 12 * a - 3;
    const jdn =
      d +
      this.floorDiv(153 * mAdj + 2, 5) +
      365 * yAdj +
      this.floorDiv(yAdj, 4) -
      this.floorDiv(yAdj, 100) +
      this.floorDiv(yAdj, 400) -
      32045;

    const tzolkinNumber = ((jdn + 4) % 13) + 1;
    const tzolkinDaySign = dayNames[(jdn + 16) % 20];
    const englishMeaning = englishMeanings[tzolkinDaySign];

    return `${tzolkinNumber} ${tzolkinDaySign} (${englishMeaning})`;
  }

  // 5. Egyptian Zodiac Sign
  getEgyptianZodiacSign(birthdate) {
    const egyptianZodiacSigns = [
      {
        name: "Nile",
        periods: [
          { startMonth: 1, startDay: 1, endMonth: 1, endDay: 7 },
          { startMonth: 6, startDay: 19, endMonth: 6, endDay: 28 },
          { startMonth: 9, startDay: 1, endMonth: 9, endDay: 7 },
          { startMonth: 11, startDay: 18, endMonth: 11, endDay: 26 },
        ],
      },
      {
        name: "Amun-Ra",
        periods: [
          { startMonth: 1, startDay: 8, endMonth: 1, endDay: 21 },
          { startMonth: 2, startDay: 1, endMonth: 2, endDay: 11 },
        ],
      },
      {
        name: "Mut",
        periods: [
          { startMonth: 1, startDay: 22, endMonth: 1, endDay: 31 },
          { startMonth: 9, startDay: 8, endMonth: 9, endDay: 22 },
        ],
      },
      {
        name: "Geb",
        periods: [
          { startMonth: 2, startDay: 12, endMonth: 2, endDay: 29 },
          { startMonth: 8, startDay: 20, endMonth: 8, endDay: 31 },
        ],
      },
      {
        name: "Osiris",
        periods: [
          { startMonth: 3, startDay: 1, endMonth: 3, endDay: 10 },
          { startMonth: 11, startDay: 27, endMonth: 12, endDay: 18 },
        ],
      },
      {
        name: "Isis",
        periods: [
          { startMonth: 3, startDay: 11, endMonth: 3, endDay: 31 },
          { startMonth: 10, startDay: 18, endMonth: 10, endDay: 29 },
          { startMonth: 12, startDay: 19, endMonth: 12, endDay: 31 },
        ],
      },
      {
        name: "Thoth",
        periods: [
          { startMonth: 4, startDay: 1, endMonth: 4, endDay: 19 },
          { startMonth: 11, startDay: 8, endMonth: 11, endDay: 17 },
        ],
      },
      {
        name: "Horus",
        periods: [
          { startMonth: 4, startDay: 20, endMonth: 5, endDay: 7 },
          { startMonth: 8, startDay: 12, endMonth: 8, endDay: 19 },
        ],
      },
      {
        name: "Anubis",
        periods: [
          { startMonth: 5, startDay: 8, endMonth: 5, endDay: 27 },
          { startMonth: 6, startDay: 29, endMonth: 7, endDay: 13 },
        ],
      },
      {
        name: "Seth",
        periods: [
          { startMonth: 5, startDay: 28, endMonth: 6, endDay: 18 },
          { startMonth: 9, startDay: 28, endMonth: 10, endDay: 2 },
        ],
      },
      {
        name: "Bastet",
        periods: [
          { startMonth: 7, startDay: 14, endMonth: 7, endDay: 28 },
          { startMonth: 9, startDay: 23, endMonth: 9, endDay: 27 },
          { startMonth: 10, startDay: 3, endMonth: 10, endDay: 17 },
        ],
      },
      {
        name: "Sekhmet",
        periods: [
          { startMonth: 7, startDay: 29, endMonth: 8, endDay: 11 },
          { startMonth: 10, startDay: 30, endMonth: 11, endDay: 7 },
        ],
      },
    ];

    const month = birthdate.getMonth() + 1;
    const day = birthdate.getDate();

    for (const sign of egyptianZodiacSigns) {
      for (const period of sign.periods) {
        if (
          (month > period.startMonth ||
            (month === period.startMonth && day >= period.startDay)) &&
          (month < period.endMonth ||
            (month === period.endMonth && day <= period.endDay))
        ) {
          return sign.name;
        }
      }
    }
    return "Unknown";
  }

  // 6. Celtic Tree Astrology Sign
  getCelticTreeSign(birthdate) {
    const celticTreeSigns = [
      { name: "Birch", startMonth: 12, startDay: 24, endMonth: 1, endDay: 20 },
      { name: "Rowan", startMonth: 1, startDay: 21, endMonth: 2, endDay: 17 },
      { name: "Ash", startMonth: 2, startDay: 18, endMonth: 3, endDay: 17 },
      { name: "Alder", startMonth: 3, startDay: 18, endMonth: 4, endDay: 14 },
      { name: "Willow", startMonth: 4, startDay: 15, endMonth: 5, endDay: 12 },
      { name: "Hawthorn", startMonth: 5, startDay: 13, endMonth: 6, endDay: 9 },
      { name: "Oak", startMonth: 6, startDay: 10, endMonth: 7, endDay: 7 },
      { name: "Holly", startMonth: 7, startDay: 8, endMonth: 8, endDay: 4 },
      { name: "Hazel", startMonth: 8, startDay: 5, endMonth: 9, endDay: 1 },
      { name: "Vine", startMonth: 9, startDay: 2, endMonth: 9, endDay: 29 },
      { name: "Ivy", startMonth: 9, startDay: 30, endMonth: 10, endDay: 27 },
      { name: "Reed", startMonth: 10, startDay: 28, endMonth: 11, endDay: 24 },
      { name: "Elder", startMonth: 11, startDay: 25, endMonth: 12, endDay: 23 },
    ];

    const month = birthdate.getMonth() + 1;
    const day = birthdate.getDate();

    for (const sign of celticTreeSigns) {
      if (
        (month === sign.startMonth && day >= sign.startDay) ||
        (month === sign.endMonth && day <= sign.endDay)
      ) {
        return sign.name;
      }
    }
    return "Unknown";
  }

  // 7. Birthstone
  getBirthstone(month) {
    const stones = [
      "Garnet",
      "Amethyst",
      "Bloodstone",
      "Diamond",
      "Emerald",
      "Pearl",
      "Ruby",
      "Sardonyx",
      "Sapphire",
      "Opal",
      "Topaz",
      "Lapis Lazuli",
    ];
    return stones[month - 1];
  }

  // 8. Life Path Number (Numerology)
  reduceToSingleDigitOrMasterNumber(number, finalReduction = true) {
    if ([11, 22, 33].includes(number) && !finalReduction) {
      return number;
    }
    while (number > 9 && ![11, 22, 33].includes(number)) {
      number = String(number)
        .split("")
        .reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return number;
  }

  calculateLifePathNumber(birthdate) {
    const month = this.reduceToSingleDigitOrMasterNumber(
      birthdate.getUTCMonth() + 1,
      false
    );
    const day = this.reduceToSingleDigitOrMasterNumber(
      birthdate.getUTCDate(),
      false
    );
    const yearSum = String(birthdate.getUTCFullYear())
      .split("")
      .reduce((sum, digit) => sum + parseInt(digit), 0);
    const year = this.reduceToSingleDigitOrMasterNumber(yearSum, false);
    const lifePathSum = month + day + year;
    return this.reduceToSingleDigitOrMasterNumber(lifePathSum, true);
  }

  // 9. Tarot Birth Cards
  calculateTarotBirthCards(birthdate) {
    const majorArcana = [
      "The Fool",
      "The Magician",
      "The High Priestess",
      "The Empress",
      "The Emperor",
      "The Hierophant",
      "The Lovers",
      "The Chariot",
      "Strength",
      "The Hermit",
      "Wheel of Fortune",
      "Justice",
      "The Hanged Man",
      "Death",
      "Temperance",
      "The Devil",
      "The Tower",
      "The Star",
      "The Moon",
      "The Sun",
      "Judgement",
      "The World",
    ];

    const mm = birthdate.getUTCMonth() + 1;
    const dd = birthdate.getUTCDate();
    const yyyy = birthdate.getUTCFullYear();
    const total00 = mm + dd + (yyyy % 100) + Math.floor(yyyy / 100); // e.g. 1 Jan 2000 → 22

    // Collapse 3‑digit numbers (rare) to two digits
    let total =
      total00 >= 100 ? Math.floor(total00 / 10) + (total00 % 10) : total00;

    // Keep 22 intact (The Fool); otherwise reduce until ≤ 22
    while (total > 22) {
      total = [...String(total)].reduce((s, d) => s + +d, 0);
    }

    // ---------- FIRST CARD ----------
    const firstIndex = total === 22 ? 0 : total; // map 22 → 0
    const firstCard = majorArcana[firstIndex];

    // ---------- SECOND CARD ----------
    let secondIndex;
    if (total === 22) {
      // The Fool’s partner is 2 + 2 = 4
      secondIndex = 4;
    } else if (total >= 10) {
      // 10–21 → sum the digits once
      secondIndex = [...String(total)].reduce((s, d) => s + +d, 0);
    } else {
      // 1–9  → add 9
      secondIndex = total + 9;
    }
    const secondCard = majorArcana[secondIndex];

    return [firstCard, secondCard];
  }

  // 10. Feng Shui Kua Number
  calculateKuaNumber(year, gender) {
    const lastTwoDigits = String(year).slice(-2);
    let lastTwoDigitsSum = lastTwoDigits
      .split("")
      .reduce((sum, digit) => sum + parseInt(digit), 0);

    while (lastTwoDigitsSum > 9) {
      lastTwoDigitsSum = String(lastTwoDigitsSum)
        .split("")
        .reduce((sum, digit) => sum + parseInt(digit), 0);
    }

    let kuaNumber;
    if (gender.toLowerCase() === "male") {
      kuaNumber = 10 - lastTwoDigitsSum;
    } else if (gender.toLowerCase() === "female") {
      kuaNumber = (lastTwoDigitsSum + 5) % 9;
    }

    if (kuaNumber === 0) {
      kuaNumber = 9;
    }

    return kuaNumber;
  }

  getKuaGroupAndDirections(kuaNumber) {
    const eastGroup = [1, 3, 4, 9];
    const westGroup = [2, 5, 6, 7, 8];

    let group, auspicious, inauspicious;

    if (eastGroup.includes(kuaNumber)) {
      group = "East";
      auspicious = ["North", "South", "East", "Southeast"];
      inauspicious = ["West", "Northwest", "Southwest", "Northeast"];
    } else if (westGroup.includes(kuaNumber)) {
      group = "West";
      auspicious = ["West", "Northwest", "Southwest", "Northeast"];
      inauspicious = ["North", "South", "East", "Southeast"];
    } else {
      group = "Unknown";
      auspicious = [];
      inauspicious = [];
    }

    return { group, auspicious, inauspicious };
  }
}

// Initialize the plugin when the script loads
const zodiacAstrologyPlugin = new ZodiacAstrologyPlugin();
