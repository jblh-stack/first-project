// app.js
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DATA ---
    const products = [
        { id: 1, name: "Aura One", category: "Headphones", price: 349.00, oldPrice: null, image: "assets/aura-one.webp", badge: "New", desc: "Flagship over-ear headphones with studio-grade drivers and 40h battery.", features: ["Active Noise Cancellation", "Lossless Audio", "Memory Foam"] },
        { id: 2, name: "Aura Buds Pro", category: "Earbuds", price: 199.00, oldPrice: 229.00, image: "assets/aura-buds.webp", badge: "Sale", desc: "True wireless earbuds featuring adaptive EQ and secure fit.", features: ["Adaptive EQ", "Sweat Resistant", "Wireless Charging"] },
        { id: 3, name: "Aura Studio", category: "Headphones", price: 599.00, oldPrice: null, image: "assets/aura-studio.webp", badge: "Premium", desc: "Reference monitors for uncompromising audio professionals.", features: ["Planar Magnetic Drivers", "Open Back Design", "Premium Leather"] },
        { id: 4, name: "Aura Zero", category: "Headphones", price: 149.00, oldPrice: null, image: "assets/aura-zero.webp", badge: null, desc: "Ultra-lightweight on-ear headphones for everyday commuting.", features: ["Ultra-lightweight", "Fast Charge", "Foldable"] },
        { id: 5, name: "Aura Stand", category: "Accessories", price: 49.00, oldPrice: null, image: "assets/aura-stand.webp", badge: null, desc: "Aesthetically pleasing aluminum stand to display your gear.", features: ["Aerospace Aluminum", "Anti-slip Base", "Minimalist Design"] },
        { id: 6, name: "Aura Cable Flow", category: "Accessories", price: 29.00, oldPrice: null, image: "assets/aura-cable.webp", badge: null, desc: "Tangle-free braided audiophile cable with gold-plated connectors.", features: ["OFC Copper", "Gold Plated", "Tangle-free"] }
    ];

    // --- 2. STATE ---
    let cart = [];
    let currentView = 'home';
    let currentProductId = null;

    // --- 3. DOM ELEMENTS ---
    const appRoot = document.getElementById('app-root');
    const navLinks = document.querySelectorAll('a[data-link], button[data-link]');
    const cartToggle = document.querySelector('.cart-toggle');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartCloses = document.querySelectorAll('.cart-close, .cart-overlay');
    const cartBadge = document.getElementById('cart-badge');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalPrice = document.getElementById('cart-subtotal-price');
    const goToCheckoutBtn = document.getElementById('go-to-checkout');
    
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // Popup
    const popupOverlay = document.getElementById('popup-overlay');
    const popupCloses = document.querySelectorAll('.popup-close');
    const emailForm = document.getElementById('email-form');

    // --- 4. ROUTER / VIEW MANAGER ---
    function navigateTo(view, productId = null) {
        currentView = view;
        currentProductId = productId;
        window.scrollTo(0,0);
        
        // Update Nav Active State
        document.querySelectorAll('.nav-links a').forEach(el => {
            el.classList.remove('active');
            if(el.dataset.link === view) el.classList.add('active');
        });

        // Hide mobile menu if open
        mobileMenu.classList.add('hidden');

        // Render View
        appRoot.innerHTML = '';
        const template = document.getElementById(`view-${view}-template`);
        if(template) {
            appRoot.appendChild(template.content.cloneNode(true));
            initViewLogic(view);
        } else {
            appRoot.innerHTML = `<div class="section-padding container text-center"><h2>Page Not Found</h2></div>`;
        }
    }

    function initViewLogic(view) {
        // Re-bind links
        appRoot.querySelectorAll('[data-link]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(el.dataset.link, el.dataset.product);
            });
        });

        if (view === 'home') {
            const homeGrid = document.getElementById('home-product-grid');
            renderProductGrid(products.slice(0, 4), homeGrid);
        } else if (view === 'shop') {
            const shopGrid = document.getElementById('full-product-grid');
            renderProductGrid(products, shopGrid);
            
            // Filters
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const category = btn.dataset.filter;
                    if(category === 'all') renderProductGrid(products, shopGrid);
                    else renderProductGrid(products.filter(p => p.category.toLowerCase() === category.toLowerCase()), shopGrid);
                });
            });
        } else if (view === 'product') {
            renderProductDetail(currentProductId);
        } else if (view === 'checkout') {
            renderCheckoutSummary();
            document.getElementById('checkout-form').addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Payment processing simulated successfully. Thank you for your order!');
                cart = [];
                updateCartUI();
                navigateTo('home');
            });
        }
    }

    // --- 5. RENDERERS ---
    function renderProductGrid(productArray, container) {
        container.innerHTML = '';
        productArray.forEach(p => {
            const priceHtml = p.oldPrice ? `<span>$${p.price.toFixed(2)}</span><span class="original-price">$${p.oldPrice.toFixed(2)}</span>` : `<span>$${p.price.toFixed(2)}</span>`;
            const badgeHtml = p.badge ? `<div class="product-badge">${p.badge}</div>` : '';
            
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image-container" onclick="window.viewProduct(${p.id})">
                    ${badgeHtml}
                    <img src="${p.image}" alt="${p.name}" class="product-image">
                    <button class="btn btn-primary product-quick-add" onclick="event.stopPropagation(); window.addToCart(${p.id}, 1)">Quick Add</button>
                </div>
                <div class="product-info" onclick="window.viewProduct(${p.id})">
                    <p class="product-category">${p.category}</p>
                    <h3 class="product-title">${p.name}</h3>
                    <p class="product-price">${priceHtml}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function renderProductDetail(id) {
        const product = products.find(p => p.id == id);
        if(!product) return navigateTo('shop');

        const container = document.getElementById('product-detail-container');
        const priceHtml = product.oldPrice ? `<span class="current">$${product.price.toFixed(2)}</span><span class="original">$${product.oldPrice.toFixed(2)}</span>` : `<span class="current">$${product.price.toFixed(2)}</span>`;
        const featuresHtml = product.features.map(f => `<div class="feature-item"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg><span>${f}</span></div>`).join('');

        container.innerHTML = `
            <div class="product-layout">
                <div class="product-gallery">
                    <div class="main-image-box">
                        <img src="${product.image}" id="main-detail-image" alt="${product.name}">
                    </div>
                    <div class="thumbnail-list">
                        <div class="thumbnail active"><img src="${product.image}"></div>
                        <div class="thumbnail"><img src="${product.image}"></div>
                        <div class="thumbnail"><img src="${product.image}"></div>
                        <div class="thumbnail"><img src="${product.image}"></div>
                    </div>
                </div>
                <div class="product-meta">
                    <div class="product-category mb-1">${product.category}</div>
                    <h1>${product.name}</h1>
                    <div class="product-rating">
                        <span class="text-accent">★★★★★</span>
                        <span class="text-subtle">4.9 (128 reviews)</span>
                    </div>
                    <div class="product-price-large">${priceHtml}</div>
                    <p class="product-description">${product.desc}</p>
                    
                    <div class="product-features">
                        ${featuresHtml}
                    </div>

                    <div class="stock-indicator">
                        <div class="stock-dot"></div>
                        <span>In Stock - Ready to Ship</span>
                    </div>

                    <div class="add-to-cart-form">
                        <div class="quantity-selector">
                            <button class="qty-btn" onclick="document.getElementById('qty-input').stepDown()">-</button>
                            <input type="number" id="qty-input" class="qty-input" value="1" min="1" max="10">
                            <button class="qty-btn" onclick="document.getElementById('qty-input').stepUp()">+</button>
                        </div>
                        <button class="btn btn-primary btn-large btn-full" onclick="window.addToCart(${product.id}, document.getElementById('qty-input').value)">Add to Cart</button>
                    </div>

                    ${product.badge === 'Sale' ? `<div class="urgency-message">Sale ends soon. High demand expected.</div>` : ''}
                </div>
            </div>
        `;
    }

    function renderCheckoutSummary() {
        const container = document.getElementById('checkout-summary');
        if(cart.length === 0) {
            container.innerHTML = `<p>Your cart is empty.</p><button class="btn btn-secondary mt-2" onclick="window.navigateTo('shop')">Back to Shop</button>`;
            return;
        }

        let total = 0;
        let itemsHtml = cart.map(item => {
            total += item.price * item.quantity;
            return `
                <div class="checkout-product-mini">
                    <img src="${item.image}" alt="">
                    <div class="details">
                        <div class="flex-between"><strong>${item.name}</strong> <span>$${(item.price * item.quantity).toFixed(2)}</span></div>
                        <div class="text-subtle">Qty: ${item.quantity}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <h3 class="mb-3">Order Summary</h3>
            <div class="mb-3">${itemsHtml}</div>
            <div class="summary-item"><span>Subtotal</span> <span>$${total.toFixed(2)}</span></div>
            <div class="summary-item"><span>Shipping</span> <span>Free</span></div>
            <div class="summary-item"><span>Tax</span> <span>$${(total * 0.08).toFixed(2)}</span></div>
            <div class="summary-item total"><span>Total</span> <span>$${(total * 1.08).toFixed(2)}</span></div>
        `;
    }

    // --- 6. CART LOGIC ---
    window.addToCart = function(productId, qty) {
        qty = parseInt(qty);
        const product = products.find(p => p.id == productId);
        if(!product) return;

        const existing = cart.find(item => item.id == productId);
        if(existing) {
            existing.quantity += qty;
        } else {
            cart.push({ ...product, quantity: qty });
        }
        
        updateCartUI();
        showToast(`Added ${product.name} to cart`);
        openCart();
    };

    window.updateCartQty = function(productId, delta) {
        const item = cart.find(i => i.id == productId);
        if(item) {
            item.quantity += delta;
            if(item.quantity <= 0) {
                cart = cart.filter(i => i.id != productId);
            }
            updateCartUI();
        }
    };

    window.removeFromCart = function(productId) {
        cart = cart.filter(i => i.id != productId);
        updateCartUI();
    };

    function updateCartUI() {
        let count = 0;
        let total = 0;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is currently empty.</div>';
            goToCheckoutBtn.disabled = true;
        } else {
            cartItemsContainer.innerHTML = cart.map(item => {
                count += item.quantity;
                total += item.price * item.quantity;
                return `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <div class="flex-between mb-1">
                                <h4 class="cart-item-title">${item.name}</h4>
                                <button class="cart-item-remove" onclick="window.removeFromCart(${item.id})">Remove</button>
                            </div>
                            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                            <div class="cart-qty-mini">
                                <button onclick="window.updateCartQty(${item.id}, -1)">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="window.updateCartQty(${item.id}, 1)">+</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            goToCheckoutBtn.disabled = false;
        }

        cartBadge.textContent = count;
        cartSubtotalPrice.textContent = `$${total.toFixed(2)}`;
        
        if(currentView === 'checkout') renderCheckoutSummary();
    }

    function openCart() {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
    }
    
    function closeCart() {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
    }

    cartToggle.addEventListener('click', openCart);
    cartCloses.forEach(btn => btn.addEventListener('click', closeCart));
    goToCheckoutBtn.addEventListener('click', () => {
        closeCart();
        navigateTo('checkout');
    });

    // --- 7. GLOBAL HELPERS ---
    window.viewProduct = function(id) {
        navigateTo('product', id);
    };
    window.navigateTo = navigateTo;

    function showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- 8. EVENTS & INIT ---
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Popup logic
    setTimeout(() => {
        if(!localStorage.getItem('popupShown')) {
            popupOverlay.classList.add('active');
            localStorage.setItem('popupShown', 'true');
        }
    }, 5000);

    popupCloses.forEach(btn => btn.addEventListener('click', () => {
        popupOverlay.classList.remove('active');
    }));

    emailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        popupOverlay.classList.remove('active');
        showToast("Thanks for subscribing!");
    });

    // Handle browser back button basic simulation (by just loading home)
    window.addEventListener('popstate', () => {
        navigateTo('home');
    });

    // Init App
    navigateTo('home');
});
