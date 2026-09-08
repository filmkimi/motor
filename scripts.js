document.addEventListener('DOMContentLoaded', () => {
  // 1. ตัวกรองหมวดหมู่ & ค้นหาด่วน
  const tabButtons = document.querySelectorAll('.tab-filter');
  const bikeItems = document.querySelectorAll('.bike-item');
  const searchInput = document.getElementById('searchInput');
  const noMatch = document.getElementById('noMatch');

  let currentCategory = 'all';

  function filterBikes() {
    const keyword = searchInput.value.toLowerCase().trim();
    let count = 0;

    bikeItems.forEach(card => {
      const category = card.getAttribute('data-category');
      const name = card.getAttribute('data-name').toLowerCase();

      const matchCat = (currentCategory === 'all' || category === currentCategory);
      const matchSearch = name.includes(keyword);

      if (matchCat && matchSearch) {
        card.classList.remove('d-none');
        count++;
      } else {
        card.classList.add('d-none');
      }
    });

    if (count === 0) {
      noMatch.classList.remove('d-none');
    } else {
      noMatch.classList.add('d-none');
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      filterBikes();
    });
  });

  searchInput.addEventListener('input', filterBikes);

  // 2. ระบบ Modal คำนวณค่างวด (Finance Calculator)
  const calcButtons = document.querySelectorAll('.calc-btn');
  const calcModalEl = document.getElementById('calcModal');
  const calcModal = new bootstrap.Modal(calcModalEl);

  const modalBikeName = document.getElementById('modalBikeName');
  const modalPriceInput = document.getElementById('modalPriceInput');
  const downRange = document.getElementById('downRange');
  const downPercentText = document.getElementById('downPercentText');
  const periodSelect = document.getElementById('periodSelect');
  const monthlyResult = document.getElementById('monthlyResult');

  let currentBasePrice = 0;

  function calculatePayment() {
    const downPercent = parseInt(downRange.value, 10);
    downPercentText.innerText = `${downPercent}% (฿${((currentBasePrice * downPercent) / 100).toLocaleString()})`;

    const principal = currentBasePrice - (currentBasePrice * downPercent / 100);
    const months = parseInt(periodSelect.value, 10);
    
    // ดอกเบี้ยสมมติ 1.2% ต่อเดือน (ดอกเบี้ยทั่วไปของมอเตอร์ไซค์)
    const monthlyRate = 0.012; 
    const totalInterest = principal * monthlyRate * months;
    const totalPay = principal + totalInterest;
    const monthly = Math.round(totalPay / months);

    monthlyResult.innerText = `฿${monthly.toLocaleString()} /ด.`;
  }

  calcButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const model = btn.getAttribute('data-model');
      currentBasePrice = parseInt(btn.getAttribute('data-price'), 10);

      modalBikeName.innerText = `ประมาณการค่างวด: ${model}`;
      modalPriceInput.value = `฿${currentBasePrice.toLocaleString()}`;
      
      calculatePayment();
      calcModal.show();
    });
  });

  downRange.addEventListener('input', calculatePayment);
  periodSelect.addEventListener('change', calculatePayment);
});