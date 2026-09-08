document.addEventListener('DOMContentLoaded', () => {
  // 1. ระบบจัดการตะกร้าสินค้า (Shopping Cart System)
  let cart = [];

  const cartBadge = document.getElementById('cartBadge');
  const cartCountHeader = document.getElementById('cartCountHeader');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const searchInput = document.getElementById('searchInput');

  // ฟังก์ชันผูก Event Listener ให้ปุ่มใส่ตะกร้าทั้งหมด
  function bindAddToCartButtons() {
    const addButtons = document.querySelectorAll('.add-to-cart-btn');
    addButtons.forEach(btn => {
      // ป้องกันการผูก event ซ้ำซ้อน
      btn.replaceWith(btn.cloneNode(true));
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
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
        if (cartBtn) {
          cartBtn.classList.add('scale-105');
          setTimeout(() => cartBtn.classList.remove('scale-105'), 200);
        }
      });
    });
  }

  // ฟังก์ชันอัปเดตหน้าตาตะกร้าสินค้า
  function renderCart() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

    if (cartBadge) {
      if (totalCount > 0) {
        cartBadge.classList.remove('d-none');
        cartBadge.innerText = totalCount;
      } else {
        cartBadge.classList.add('d-none');
      }
    }

    if (cartCountHeader) {
      cartCountHeader.innerText = totalCount;
    }

    if (!cartItemsList || !cartTotalPrice) return;

    // ถ้าไม่มีสินค้า
    if (cart.length === 0) {
      cartItemsList.innerHTML = '<p class="text-secondary text-center my-5">ยังไม่มีสินค้าในตะกร้า</p>';
      cartTotalPrice.innerText = '฿0';
      return;
    }

    // แสดงรายการสินค้า
    let total = 0;
    cartItemsList.innerHTML = '';

    cart.forEach(item => {
      const itemSubtotal = item.price * item.qty;
      total += itemSubtotal;

      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item-row d-flex justify-content-between align-items-center mb-3 p-2 rounded bg-black bg-opacity-25 border border-secondary border-opacity-25';
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

  // 2. ฟังก์ชันดึงข้อมูลจาก MongoDB ผ่าน API (พอร์ต 3000) มาสร้าง Card
  async function loadBikesFromDB() {
    const bikeGrid = document.getElementById('bikeGrid');
    if (!bikeGrid) {
      // หากหน้านั้นไม่มี #bikeGrid ให้ผูกปุ่มใส่ตะกร้าสำหรับปุ่มเดิมที่มีอยู่ทันที
      bindAddToCartButtons();
      return;
    }

    try {
      const response = await fetch('/api/bikes');
      const bikes = await response.json();

      bikeGrid.innerHTML = '';

      bikes.forEach(bike => {
        const card = document.createElement('div');
        card.className = 'col-12 col-md-6 col-lg-4 bike-item';
        card.setAttribute('data-category', bike.category || 'all');
        card.setAttribute('data-name', (bike.name || '').toLowerCase());

        card.innerHTML = `
          <div class="moto-card h-100 d-flex flex-column">
            <div class="moto-thumb">
              <img src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=700&q=80" alt="${bike.name}">
              <span class="badge bg-danger position-absolute top-0 start-0 m-3 rounded-pill px-2 py-1">สินค้าแนะนำ</span>
            </div>
            <div class="p-4 d-flex flex-column flex-grow-1">
              <div class="text-warning small mb-1">★★★★★ สินค้าแท้ตรงรุ่น</div>
              <h3 class="h5 fw-bold mb-3">${bike.name}</h3>
              <p class="text-secondary small mb-3">${bike.desc || 'อะไหล่แต่งและอุปกรณ์เสริมคุณภาพสูง'}</p>

              <div class="mt-auto pt-3 border-top border-secondary border-opacity-25">
                <div class="d-flex justify-content-between align-items-end mb-3">
                  <span class="text-secondary small">ราคา</span>
                  <span class="h4 fw-bold mb-0 text-white">฿${Number(bike.price).toLocaleString()}</span>
                </div>
                <div class="d-grid gap-2">
                  <button class="btn btn-neon add-to-cart-btn" 
                    data-id="${bike._id}" 
                    data-name="${bike.name}" 
                    data-price="${bike.price}">
                    + ใส่ตะกร้า
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
        bikeGrid.appendChild(card);
      });

      // ผูกปุ่มใส่ตะกร้าให้ปุ่มที่เพิ่ง render ใหม่
      bindAddToCartButtons();

    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
    }
  }

  // เรียกโหลดสินค้าจาก Database
  loadBikesFromDB();

  // ล้างตะกร้าทั้งหมด
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      cart = [];
      renderCart();
    });
  }

  // ปุ่มสั่งซื้อผ่าน LINE
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('กรุณาเลือกสินค้าใส่ตะกร้าก่อนทำการสั่งซื้อครับ');
        return;
      }
      const orderSummary = cart.map(i => `${i.name} (${i.qty} คัน/ชิ้น)`).join(', ');
      alert(`ระบบบันทึกคำสั่งซื้อของคุณ: ${orderSummary}\nยอดรวม ${cartTotalPrice.innerText}\nเตรียมส่งข้อมูลไปยัง LINE เจ้าหน้าที่!`);
    });
  }

  // 3. ระบบค้นหาแบบเรียลไทม์
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const keyword = searchInput.value.toLowerCase().trim();
      const currentBikeItems = document.querySelectorAll('.bike-item');
      let hasMatch = false;

      currentBikeItems.forEach(card => {
        const name = (card.getAttribute('data-name') || '').toLowerCase();
        if (name.includes(keyword)) {
          card.classList.remove('d-none');
          hasMatch = true;
        } else {
          card.classList.add('d-none');
        }
      });

      const noMatch = document.getElementById('noMatch');
      if (noMatch) {
        if (!hasMatch && keyword !== '') {
          noMatch.classList.remove('d-none');
        } else {
          noMatch.classList.add('d-none');
        }
      }
    });
  }
});