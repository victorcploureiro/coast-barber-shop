import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url?: string;
  description?: string;
  brand?: string;
}

const categories = ['Todos', 'Cabelo', 'Barba', 'Cuidados', 'Kits'];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === 'Todos' || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (id: string) => {
    setCart((prev) => [...prev, id]);
  };

  const cartCount = cart.length;

  return (
    <div className="min-h-screen pb-24">
      <Header title="Loja Coast" subtitle="Produtos premium para o seu cuidado" />

      {/* Search */}
      <div className="px-5 mt-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-ink-800 border border-white/5 text-sm text-ink-100 placeholder:text-ink-400 focus:outline-none focus:border-gold-500/30 transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 mt-4 pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat
                ? 'gold-gradient text-ink-950'
                : 'bg-ink-800 text-ink-200 border border-white/5 card-hover'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="px-5 mt-4">
        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-ink-300">
            <Loader2 size={20} className="animate-spin text-gold-400" />
            <span className="text-xs">Carregando catálogo...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-8 text-center text-ink-400">
            <p className="text-xs">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product) => {
              const inCart = cart.includes(product.id);
              return (
                <div key={product.id} className="card card-hover overflow-hidden flex flex-col">
                  <div className="h-36 overflow-hidden relative">
                    <img 
                      src={product.image_url || 'https://images.unsplash.com/photo-1608248597260-6578613690d2?auto=format&fit=crop&q=80&w=400'} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-medium text-ink-100 bg-ink-950/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-[10px] text-gold-400 font-medium mb-0.5">{product.brand || 'Coast'}</p>
                    <h4 className="text-sm font-semibold text-ink-100 leading-tight line-clamp-1">{product.name}</h4>
                    <p className="text-[11px] text-ink-300 mt-0.5 line-clamp-2 flex-1">{product.description || 'Produto exclusivo Coast Barber Shop'}</p>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="font-display text-lg gold-text tracking-wide">R${product.price}</span>
                      <button
                        onClick={() => addToCart(product.id)}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                          inCart ? 'bg-green-500/20 border border-green-500/30' : 'gold-gradient'
                        }`}
                      >
                        {inCart ? (
                          <span className="text-xs text-green-400 font-bold">{cart.filter((c) => c === product.id).length}</span>
                        ) : (
                          <Plus size={16} className="text-ink-950" strokeWidth={2.5} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-[72px] left-0 right-0 z-20 px-5 pt-3 pb-3 animate-slide-up">
          <div className="glass-strong rounded-2xl border border-gold-500/20 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-xl gold-gradient flex items-center justify-center">
                <ShoppingBag size={18} className="text-ink-950" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-ink-950 border border-gold-400 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-gold-400">{cartCount}</span>
                </span>
              </div>
              <div>
                <p className="text-xs text-ink-300">{cartCount} {cartCount === 1 ? 'item' : 'itens'} no carrinho</p>
                <p className="text-sm font-semibold text-ink-100">
                  R${cart.reduce((sum, id) => sum + (products.find((p) => p.id === id)?.price ?? 0), 0)}
                </p>
              </div>
            </div>
            <button className="px-4 py-2.5 rounded-xl gold-gradient text-ink-950 text-sm font-bold active:scale-95 transition-transform">
              Finalizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}