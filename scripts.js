document.addEventListener('DOMContentLoaded', () => {
  // 1. ระบบจัดการตะกร้าสินค้า (Shopping Cart System)
  let cart = [];

  const cartBadge = document.getElementById('cartBadge');
  const cartCountHeader = document.getElementById('cartCountHeader');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // เพิ่มสินค้าลงตะกร้า
  const addButtons = document.querySelectorAll('.add-to-cart-btn');
  addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseInt(btn.getAttribute('data-price'), 10);

      const existingItem = cart.find(item => item.id === id);
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        cart.push({ id, name, price, qty: 1 });
      }

      renderCart();

      // แสดง Animation เล็กน้อยที่ปุ่มตะกร้า
      const cartBtn = document.querySelector('.btn-cart');
      cartBtn.classList.add('scale-105');
      setTimeout(() => cartBtn.classList.remove('scale-105'), 200);
    });
  });

  // อัปเดตหน้าตาตะกร้าสินค้า
  function renderCart() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

    // อัปเดตตัวเลข Badge
    if (totalCount > 0) {
      cartBadge.classList.remove('d-none');
      cartBadge.innerText = totalCount;
    } else {
      cartBadge.classList.add('d-none');
    }
    cartCountHeader.innerText = totalCount;

    // ถ้าไม่มีสินค้า
    if (cart.length === 0) {
      cartItemsList.innerHTML = '<p class="text-secondary text-center my-5">ยังไม่มีสินค้าในตะกร้า</p>';
      cartTotalPrice.innerText = '฿0';
      return;
    }

    // วนลูปแสดงสินค้า
    let total = 0;
    cartItemsList.innerHTML = '';

    cart.forEach(item => {
      const itemSubtotal = item.price * item.qty;
      total += itemSubtotal;

      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item-row d-flex justify-content-between align-items-center';
      itemRow.innerHTML = `
        <div>
          <div class="fw-bold text-white small">${item.name}</div>
          <div class="text-secondary small">฿${item.price.toLocaleString()} x ${item.qty}</div>
        </div>
        <div class="text-end">
          <div class="fw-bold text-warning small mb-1">฿${itemSubtotal.toLocaleString()}</div>
          <button class="btn btn-outline-danger btn-sm py-0 px-2 remove-item-btn" data-id="${item.id}" style="font-size: 0.75rem;">ลบ</button>
        </div>
      `;
      cartItemsList.appendChild(itemRow);
    });

    cartTotalPrice.innerText = `฿${total.toLocaleString()}`;

    // ผูกปุ่มลบรายชิ้น
    document.querySelectorAll('.remove-item-btn').forEach(delBtn => {
      delBtn.addEventListener('click', () => {
        const idToRemove = delBtn.getAttribute('data-id');
        cart = cart.filter(item => item.id !== idToRemove);
        renderCart();
      });
    });
  }

  // ล้างตะกร้าทั้งหมด
  clearCartBtn.addEventListener('click', () => {
    cart = [];
    renderCart();
  });

  // ปุ่มสั่งซื้อผ่าน LINE
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('กรุณาเลือกสินค้าใส่ตะกร้าก่อนทำการสั่งซื้อครับ');
      return;
    }
    const orderSummary = cart.map(i => `${i.name} (${i.qty} คัน/ชิ้น)`).join(', ');
    alert(`ระบบบันทึกคำสั่งซื้อของคุณ: ${orderSummary}\nยอดรวม ${cartTotalPrice.innerText}\nเตรียมส่งข้อมูลไปยัง LINE เจ้าหน้าที่!`);
  });

  // 2. การค้นหาด่วนแบบพิมพ์เรียลไทม์
  const searchInput = document.getElementById('searchInput');
  const bikeItems = document.querySelectorAll('.bike-item');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const keyword = searchInput.value.toLowerCase().trim();
      bikeItems.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        if (name.includes(keyword)) {
          card.classList.remove('d-none');
        } else {
          card.classList.add('d-none');
        }
      });
    });
  }
});