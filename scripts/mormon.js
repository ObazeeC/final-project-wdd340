const dataURL = "https://raw.githubusercontent.com/ObazeeC/my-final-project-wdd330/refs/heads/main/bomJS/bok.json";

let verses = [];          // flattened list of all verses
let lastSearchResults = []; 
let currentIndex = 0;     // for rotation

// -----------------------------------------------------
// LOAD DATA ONCE
// -----------------------------------------------------
async function loadData() {
  const response = await fetch(dataURL);
  const data = await response.json();

  // Flatten verses
  verses = data.books.flatMap(book =>
    book.chapters.flatMap(chapter =>
      chapter.verses.map((v, i) => ({
        book: book.book,
        chapter: chapter.chapter,
        verse: i + 1,
        text: v.text
      }))
    )
  );

  // Restore saved index
  currentIndex = Number(localStorage.getItem("verseIndex")) || 0;
}

// -----------------------------------------------------
// ROTATING VERSE DISPLAY
// -----------------------------------------------------
function startVerseRotation() {
  const DISPLAY_INTERVAL = 30 * 60 * 1000; // 30 minutes

  function displayVerse() {
    const v = verses[currentIndex];

    document.getElementById("verse").innerHTML = `
      <strong>${v.book} ${v.chapter}:${v.verse}</strong><br>
      ${v.text}
    `;

    // Sequential rotation
    currentIndex = (currentIndex + 1) % verses.length;

    // If you want RANDOM rotation instead, replace above line with:
    // currentIndex = Math.floor(Math.random() * verses.length);

    localStorage.setItem("verseIndex", currentIndex);
  }

  displayVerse();
  setInterval(displayVerse, DISPLAY_INTERVAL);
}

// -----------------------------------------------------
// SEARCH FUNCTION
// -----------------------------------------------------
function searchVerses(query) {
  const container = document.getElementById("searchResults");
  container.innerHTML = "";

  if (!query.trim()) {
    container.innerHTML = "<p>Please enter a keyword or phrase.</p>";
    return;
  }

  const lowerQuery = query.toLowerCase();

  // Find matches
  lastSearchResults = verses.filter(v =>
    v.text.toLowerCase().includes(lowerQuery)
  );

  if (lastSearchResults.length === 0) {
    container.innerHTML = `<p>No verses found containing "${query}".</p>`;
    return;
  }

  // --- TOP 3 RESULTS WITH TEXT ---
  const topThree = lastSearchResults.slice(0, 3);

  container.innerHTML += `<h3 id="result">Top 3 Results</h3>`;
  topThree.forEach(v => {
    container.innerHTML += `
      <p class="verRef">
        <strong>${v.book} ${v.chapter}:${v.verse}</strong><br>
        ${v.text}
      </p>
    `;
  });

  // --- OTHER REFERENCES (NO TEXT) ---
  const remaining = lastSearchResults.slice(3);

  if (remaining.length > 0) {
    container.innerHTML += `<h3>Other References</h3><ul>`;

    // Limit to 5
    remaining.slice(0, 3).forEach(v => {
      container.innerHTML += `<li class="otherRef">${v.book} ${v.chapter}:${v.verse}</li>`;
    });

    container.innerHTML += `</ul>`;
  }
}

// -----------------------------------------------------
// INITIALIZE EVERYTHING
// -----------------------------------------------------
async function init() {
  await loadData();
  startVerseRotation();

  // Hook search button
  document.getElementById("searchBtn").addEventListener("click", () => {
    const keyword = document.getElementById("searchInput").value.trim();
    searchVerses(keyword);
  });
}

init();
