document.addEventListener('DOMContentLoaded', () => {
  // 0. ไฮไลต์ปุ่ม Navbar ตามหน้าที่เปิดอยู่ค้างไว้ทันที
  const currentPath = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.custom-nav-link');
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPath || (currentPath === '' && linkHref === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // ดึงข้อมูลตะกร้าจาก localStorage (ถ้าไม่มีให้เริ่มด้วย array ว่าง)
  let cart = JSON.parse(localStorage.getItem('torque_cart')) || [];

  const cartBadge = document.getElementById('cartBadge');
  const cartCountHeader = document.getElementById('cartCountHeader');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const modalTotalAmount = document.getElementById('modalTotalAmount');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const confirmOrderBtn = document.getElementById('confirmOrderBtn');
  const openCheckoutModalBtn = document.getElementById('openCheckoutModalBtn');

  // ฟังก์ชันสร้างกล่องข้อความสีเหลืองเข้ม (แสดงเฉพาะหน้านั้น พอเปลี่ยนหน้าก็หายไป)
  function showNotification(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'torque-toast';
    toast.innerHTML = `<span>⚡</span> <div>${message}</div>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }

  // ฟังก์ชันบันทึกตะกร้าลง localStorage
  function saveCart() {
    localStorage.setItem('torque_cart', JSON.stringify(cart));
  }

  // 1. ฟังก์ชันแสดงผลข้อมูลในตะกร้า
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

    if (cart.length === 0) {
      cartItemsList.innerHTML = '<p class="text-secondary text-center my-5">ยังไม่มีสินค้าในตะกร้า</p>';
      cartTotalPrice.innerText = '฿0';
      if (modalTotalAmount) modalTotalAmount.innerText = '฿0';
      return;
    }

    let total = 0;
    cartItemsList.innerHTML = '';

    cart.forEach(item => {
      const itemSubtotal = item.price * item.qty;
      total += itemSubtotal;

      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item-row d-flex justify-content-between align-items-center mb-3 p-2 rounded bg-black bg-opacity-25 border border-secondary border-opacity-25';
      itemRow.innerHTML = `
        <div style="max-width: 65%;">
          <div class="fw-bold text-white small text-truncate">${item.name}</div>
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
    if (modalTotalAmount) modalTotalAmount.innerText = `฿${total.toLocaleString()}`;

    // ผูกปุ่มลบรายชิ้น
    document.querySelectorAll('.remove-item-btn').forEach(delBtn => {
      delBtn.addEventListener('click', () => {
        const idToRemove = delBtn.getAttribute('data-id');
        cart = cart.filter(item => item.id !== idToRemove);
        saveCart();
        renderCart();
        showNotification('ลบสินค้าออกจากตะกร้าเรียบร้อย');
      });
    });
  }

  // 2. ดักจับ Event กดปุ่มใส่ตะกร้า (Event Delegation)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (!btn) return;

    const card = btn.closest('.moto-card');
    const bikeTitle = card ? card.querySelector('h3')?.innerText.trim() : '';
    const partTitle = card ? card.querySelectorAll('.spec-chip')[1]?.innerText.trim() : '';
    
    const itemName = partTitle ? `${bikeTitle} (${partTitle})` : (bikeTitle || btn.getAttribute('data-name') || 'สินค้า');
    const itemId = btn.getAttribute('data-id') || itemName;
    const itemPrice = parseInt(btn.getAttribute('data-price'), 10) || 0;

    const existingItem = cart.find(item => item.id === itemId);
    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push({
        id: itemId,
        name: itemName,
        price: itemPrice,
        qty: 1
      });
    }

    saveCart();
    renderCart();

    // แสดงกล่องแจ้งเตือนสีเหลืองเข้ม
    showNotification(`เพิ่ม <b>${itemName}</b> ลงตะกร้าแล้ว`);

    // Animation Effect บนปุ่มตะกร้า
    const cartNavBtn = document.querySelector('.btn-cart');
    if (cartNavBtn) {
      cartNavBtn.classList.add('scale-105');
      setTimeout(() => cartNavBtn.classList.remove('scale-105'), 200);
    }
  });

  // 3. ปุ่มล้างตะกร้า
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      cart = [];
      saveCart();
      renderCart();
      showNotification('ล้างรายการในตะกร้าทั้งหมดแล้ว');
    });
  }

  // 4. ตรวจสอบก่อนเปิด Modal สั่งซื้อ
  if (openCheckoutModalBtn) {
    openCheckoutModalBtn.addEventListener('click', (e) => {
      if (cart.length === 0) {
        e.preventDefault();
        e.stopPropagation();
        showNotification('กรุณาเลือกสินค้าใส่ตะกร้าก่อนทำการสั่งซื้อ');
      }
    });
  }

  // 5. ส่งคำสั่งซื้อไปยัง API (/api/orders) บันทึกเข้า MongoDB
  if (confirmOrderBtn) {
    confirmOrderBtn.addEventListener('click', async () => {
      const nameInput = document.getElementById('customerName');
      const phoneInput = document.getElementById('customerPhone');

      const customerName = nameInput ? nameInput.value.trim() : '';
      const customerPhone = phoneInput ? phoneInput.value.trim() : '';

      if (!customerName || !customerPhone) {
        showNotification('กรุณากรอกชื่อและเบอร์โทรศัพท์ให้ครบถ้วน');
        return;
      }

      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

      const payload = {
        customerName,
        customerPhone,
        items: cart,
        totalAmount
      };

      try {
        confirmOrderBtn.disabled = true;
        confirmOrderBtn.innerText = 'กำลังบันทึกข้อมูล...';

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
          showNotification(`✅ สั่งซื้อสำเร็จ! รหัสสั่งซื้อ: ${data.orderId}`);
          
          cart = [];
          saveCart();
          renderCart();
          if (nameInput) nameInput.value = '';
          if (phoneInput) phoneInput.value = '';

          const modalEl = document.getElementById('checkoutModal');
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();

          const sidebarEl = document.getElementById('cartSidebar');
          const offcanvasInstance = bootstrap.Offcanvas.getInstance(sidebarEl);
          if (offcanvasInstance) offcanvasInstance.hide();
        } else {
          showNotification(`เกิดข้อผิดพลาด: ${data.message || data.error}`);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        showNotification('ไม่สามารถเชื่อมต่อระบบหลังบ้านได้');
      } finally {
        confirmOrderBtn.disabled = false;
        confirmOrderBtn.innerText = 'ยืนยัน';
      }
    });
  }

  // โหลดข้อมูลตะกร้าที่เคยมีขึ้นมาแสดงผลทันทีตอนเปิดหน้าใหม่
  renderCart();
});