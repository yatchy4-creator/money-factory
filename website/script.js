document.querySelectorAll('.btn').forEach((b) => {
  b.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Hook this CTA to your calendar or Stripe checkout.');
  });
});