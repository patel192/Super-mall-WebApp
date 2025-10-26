


// Smooth scroll animation for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Placeholder: load offers dynamically from Firebase later
document.getElementById("offers-container").innerHTML = `
  <div class="offer-card">
    <img src="https://via.placeholder.com/300x200" alt="Offer 1">
    <h3>Flat 50% Off on Men's Wear</h3>
    <p>Shop now and save big!</p>
  </div>
  <div class="offer-card">
    <img src="https://via.placeholder.com/300x200" alt="Offer 2">
    <h3>Electronics Mega Sale</h3>
    <p>Top gadgets with exclusive discounts.</p>
  </div>
`;





