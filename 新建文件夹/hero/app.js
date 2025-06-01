const menu = document.querySelector("#mobile-menu");
const menuLinks = document.querySelector(".navbar_menu");

menu.addEventListener("click", function () {
  menu.classList.toggle("is-active");
  menuLinks.classList.toggle("active");
  
    console.log("Menu clicked");
});
// Function to make logos move
const logos = document.querySelector(".rotating-logos_track").cloneNode(true);
document.querySelector(".rotating-logos").appendChild(logos);

// Function to toggle the pricing section
function switchPricing() {
  const checkbox = document.getElementById("pricing-toggle-checkbox");
  const monthlyPrices = document.querySelectorAll(".monthly-price");
  const yearlyPrices = document.querySelectorAll(".yearly-price");
  const yearlyDiscount = document.querySelector(".save-percentage");

  if(checkbox.checked) {
    monthlyPrices.forEach(price => price.classList.add("hidden"));
    yearlyPrices.forEach(price => price.classList.remove("hidden"));
    yearlyDiscount.style.display = "inline";
  }
  else {
    monthlyPrices.forEach(price => price.classList.remove("hidden"));
    yearlyPrices.forEach(price => price.classList.add("hidden"));
    yearlyDiscount.style.display = "none";
  }
}

window.addEventListener("load", () => {
  const yearElement = document.getElementById("year");
  const currentYear = new Date().getFullYear();
  yearElement.textContent = currentYear;
})