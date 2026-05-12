import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { supabase } from "@/src/api";

// ── Responsive scale & typography utilities ─────────────────────────────────
const BASE_WIDTH  = 375;  // reference width  (iPhone SE)
const BASE_HEIGHT = 812;  // reference height (iPhone 12/13/14)

function useScale() {
  const { width, height } = useWindowDimensions();

  /** Horizontal proportional scale */
  const scale = (size: number) => (width / BASE_WIDTH) * size;

  /** Vertical proportional scale */
  const vs = (size: number) => (height / BASE_HEIGHT) * size;

  /**
   * Moderate scale for font sizes.
   * factor 0.3 keeps fonts conservative — readable but not oversized on tablets.
   * Result is clamped so fonts never go below base or above 1.4× base.
   */
  const font = (base: number, factor = 0.3): number => {
    const scaled = base + (scale(base) - base) * factor;
    return Math.max(base * 0.88, Math.min(scaled, base * 1.4));
  };

  /**
   * Pre-built typography scale — use these instead of raw numbers.
   * Naming: display > h1 > h2 > body > caption > micro
   */
  const typo = {
    display:  { fontSize: font(26), lineHeight: font(26) * 1.15,  fontWeight: "800" as const },
    h1:       { fontSize: font(22), lineHeight: font(22) * 1.2,   fontWeight: "700" as const },
    h2:       { fontSize: font(17), lineHeight: font(17) * 1.25,  fontWeight: "700" as const },
    body:     { fontSize: font(14), lineHeight: font(14) * 1.3,   fontWeight: "400" as const },
    bodyBold: { fontSize: font(14), lineHeight: font(14) * 1.3,   fontWeight: "600" as const },
    caption:  { fontSize: font(13), lineHeight: font(13) * 1.25,  fontWeight: "500" as const },
    micro:    { fontSize: font(12), lineHeight: font(12) * 1.2,   fontWeight: "400" as const },
  };

  return { scale, vs, font, typo, width, height };
}

// ── Icons ────────────────────────────────────────────────────────────────────
function AvatarIcon({ size }: { size: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      overflow: "hidden", backgroundColor: "#16A34A",
      borderWidth: 2, borderColor: "rgba(255,255,255,0.4)",
      alignItems: "center", justifyContent: "center",
    }}>
      <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <Circle cx="20" cy="20" r="20" fill="#4CAF8C" />
        <Circle cx="20" cy="15" r="8" fill="#ffffff" opacity="0.9" />
        <Path d="M4 36 C4 28 36 28 36 36" fill="#ffffff" opacity="0.9" />
      </Svg>
    </View>
  );
}

function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M10 18.33C10.46 18.33 10.83 17.96 10.83 17.5H9.17C9.17 17.96 9.54 18.33 10 18.33Z" fill="white" />
      <Path d="M10 1.67C6.78 1.67 4.17 4.28 4.17 7.5V12.5L2.5 14.17V15H17.5V14.17L15.83 12.5V7.5C15.83 4.28 13.22 1.67 10 1.67Z" fill="white" />
    </Svg>
  );
}

function LocationIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M8 1.33C5.42 1.33 3.33 3.42 3.33 6C3.33 9.5 8 14.67 8 14.67C8 14.67 12.67 9.5 12.67 6C12.67 3.42 10.58 1.33 8 1.33Z" stroke="#22C55E" strokeWidth="1.5" fill="none" />
      <Circle cx="8" cy="6" r="1.67" stroke="#22C55E" strokeWidth="1.5" />
    </Svg>
  );
}

function ArrowRightIcon({ color = "#22C55E", size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M3.33 8H12.67M9.33 4.67L12.67 8L9.33 11.33" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Price icons ──────────────────────────────────────────────────────────────
function PriceIcon({ bg, children }: { bg: string; children: React.ReactNode }) {
  const { scale } = useScale();
  const iconSize = scale(40);
  return (
    <View style={{ width: iconSize, height: iconSize, borderRadius: scale(11), backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      {children}
    </View>
  );
}

// ── Bottom nav icons ─────────────────────────────────────────────────────────
function HomeNavIcon({ active }: { active?: boolean }) {
  const c = active ? "#22C55E" : "#9E9E9E";
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
        fill={active ? "#22C55E" : "none"} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HistoryNavIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke="#9E9E9E" strokeWidth="1.8" />
      <Path d="M12 7V12L15 14" stroke="#9E9E9E" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function ProfileNavIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke="#9E9E9E" strokeWidth="1.8" />
      <Path d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20" stroke="#9E9E9E" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

// ── Price item ────────────────────────────────────────────────────────────────
function PriceItem({ iconBg, iconChild, name, price }: {
  iconBg: string;
  iconChild: React.ReactNode;
  name: string;
  price: string;
}) {
  const { scale, typo } = useScale();
  return (
    <View style={{
      flex: 1,
      backgroundColor: "white",
      borderRadius: scale(14),
      padding: scale(12),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
      borderWidth: 1.5,
      borderColor: "#E8E8E8",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    }}>
      <PriceIcon bg={iconBg}>{iconChild}</PriceIcon>
      <View style={{ flex: 1 }}>
        <Text
          allowFontScaling={false}
          style={{ ...typo.caption, color: "#6B6B6B", marginBottom: 3 }}
        >
          {name}
        </Text>
        <Text
          allowFontScaling={false}
          style={{ ...typo.bodyBold, color: "#1A1A1A" }}
        >
          {price}
        </Text>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MyOrdersScreen() {
  const router = useRouter();
  const { scale, vs, typo, width } = useScale();

  const statusBarH = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 0;

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Đang tải...");
  const [userAddress, setUserAddress] = useState("Đang kiểm tra vị trí...");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = 'f81d4fae-7dec-11d0-a765-00a0c91e8ff6';
        
        // Lấy thông tin user
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', userId)
          .single();
          
        if (userData) {
          setUserName(userData.full_name);
        }

        // Lấy địa chỉ mặc định
        const { data: addressData, error: addressError } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', userId)
          .eq('is_default', true)
          .single();
          
        if (addressData) {
          setUserAddress(`${addressData.address_line}, ${addressData.ward}, ${addressData.district}, ${addressData.city}`);
        } else {
          // Lấy địa chỉ đầu tiên nếu không có mặc định
          const { data: anyAddress } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .single();
          if (anyAddress) {
            setUserAddress(`${anyAddress.address_line}, ${anyAddress.ward}, ${anyAddress.district}, ${anyAddress.city}`);
          }
        }

        // Lấy danh mục tái chế, display_order từ 1 tới 4
        const { data: categoriesData, error: catError } = await supabase
          .from('scrap_categories')
          .select('*')
          .gte('display_order', 1)
          .lte('display_order', 4)
          .order('display_order', { ascending: true })
          .limit(4);
          
        if (categoriesData) {
          setCategories(categoriesData);
        }

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatPrice = (priceStr: string) => {
    const p = parseFloat(priceStr);
    if (isNaN(p)) return "";
    return (p / 1000).toString() + ".000đ";
  };

  // Các icon ngẫu nhiên hoặc cố định để minh họa cho nguyên liệu
  const getCategoryIcon = (order: number) => {
    switch(order) {
      case 1:
        return {
          iconBg: "#FFF3E0",
          iconChild: (
            <Svg width={scale(22)} height={scale(22)} viewBox="0 0 24 24" fill="none">
              <Rect x="4" y="3" width="12" height="16" rx="2" fill="#FB8C00" />
              <Path d="M7 8H13M7 11H13M7 14H10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </Svg>
          )
        };
      case 2:
         return {
          iconBg: "#E3F2FD",
          iconChild: (
            <Svg width={scale(22)} height={scale(22)} viewBox="0 0 24 24" fill="none">
              <Path d="M10 3H14C14 3 15 5 15 7V18C15 19.1 14.1 20 13 20H11C9.9 20 9 19.1 9 18V7C9 5 10 3 10 3Z" fill="#2196F3" />
              <Rect x="9" y="3" width="6" height="3" rx="1" fill="#64B5F6" />
            </Svg>
          )
        };
      case 3:
         return {
          iconBg: "#F5F5F5",
          iconChild: (
            <Svg width={scale(22)} height={scale(22)} viewBox="0 0 24 24" fill="none">
              <Path d="M6 9H18L16 19H8L6 9Z" fill="#9E9E9E" />
              <Rect x="7" y="6" width="10" height="4" rx="2" fill="#BDBDBD" />
            </Svg>
          )
        };
      case 4:
      default:
         return {
          iconBg: "#F3E5F5",
          iconChild: (
             <Svg width={scale(22)} height={scale(22)} viewBox="0 0 24 24" fill="none">
              <Rect x="3" y="6" width="18" height="12" rx="2" fill="#9C27B0" />
              <Rect x="5" y="8" width="14" height="8" rx="1" fill="#CE93D8" />
            </Svg>
          )
        };
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#22C55E" translucent />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Green header ── */}
        <View style={[styles.header, {
          paddingTop: statusBarH + vs(44),
          paddingHorizontal: scale(20),
          paddingBottom: vs(90),
          borderBottomLeftRadius: scale(28),
          borderBottomRightRadius: scale(28),
        }]}>
          {/* Greeting row */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: vs(14) }}>
            <AvatarIcon size={scale(50)} />
            <View style={{ flex: 1, marginLeft: scale(12) }}>
              <Text
                allowFontScaling={false}
                style={{ ...typo.caption, color: "rgba(255,255,255,0.85)" }}
              >
                Xin chào,
              </Text>
              <Text
                allowFontScaling={false}
                style={{ ...typo.h1, color: "white" }}
              >
                {userName}
              </Text>
            </View>
            <TouchableOpacity style={[styles.bellBtn, {
              width: scale(38), height: scale(38), borderRadius: scale(19),
            }]}>
              <BellIcon size={scale(20)} />
            </TouchableOpacity>
          </View>

          {/* Location bar */}
          <TouchableOpacity style={[styles.locationBar, {
            borderRadius: scale(12),
            paddingHorizontal: scale(14),
            paddingVertical: vs(10),
          }]}>
            <LocationIcon size={scale(16)} />
            <View style={{ flex: 1, marginLeft: scale(8) }}>
              <Text
                allowFontScaling={false}
                style={{ ...typo.micro, color: "rgba(255,255,255,0.8)", marginBottom: 2 }}
              >
                Vị trí thu gom hiện tại
              </Text>
              <Text
                allowFontScaling={false}
                style={{ ...typo.bodyBold, color: "white" }}
                numberOfLines={1}
              >
                {userAddress}
              </Text>
            </View>
            <ArrowRightIcon color="white" size={scale(16)} />
          </TouchableOpacity>
        </View>

        {/* ── Body ── */}
        <View style={{ paddingHorizontal: scale(16), marginTop: -vs(74) }}>

          {/* Booking card */}
          <View style={[styles.bookingCard, {
            borderRadius: scale(20),
            padding: scale(20),
            marginBottom: vs(20),
          }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: vs(12) }}>
              {/* Badge */}
              <View style={[styles.readyBadge, { borderRadius: scale(20), paddingHorizontal: scale(10), paddingVertical: vs(4) }]}>
                <View style={styles.readyDot} />
                <Text
                  allowFontScaling={false}
                  style={{ ...typo.caption, color: "#FB8C00" }}
                >
                  Sẵn sàng thu gom
                </Text>
              </View>
              {/* Plus btn */}
              <TouchableOpacity style={[styles.plusBtn, {
                width: scale(44), height: scale(44), borderRadius: scale(14),
              }]}>
                <Text
                  allowFontScaling={false}
                  style={{ color: "#22C55E", fontSize: scale(26), fontWeight: "300", lineHeight: scale(30) }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              allowFontScaling={false}
              style={{ ...typo.display, color: "#1A1A1A", marginBottom: vs(8) }}
            >
              Thu Gom Phế{"\n"}Liệu Tận Nơi
            </Text>
            <Text
              allowFontScaling={false}
              style={{ ...typo.body, color: "#9E9E9E", marginBottom: vs(20) }}
            >
              Gọi người đến lấy nhanh chóng, không lo về giá.
            </Text>

            <TouchableOpacity style={[styles.ctaBtn, { borderRadius: scale(14), paddingVertical: vs(15) }]}>
              <Text
                allowFontScaling={false}
                style={{ ...typo.bodyBold, color: "white", fontWeight: "700", letterSpacing: 0.5 }}
              >
                Đặt Lịch Ngay
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price section header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: vs(12) }}>
            <Text
              allowFontScaling={false}
              style={{ ...typo.h2, color: "#1A1A1A" }}
            >
              Bảng giá tham khảo
            </Text>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text
                allowFontScaling={false}
                style={{ ...typo.caption, color: "#22C55E", fontWeight: "600" }}
              >
                Xem tất cả
              </Text>
              <ArrowRightIcon color="#22C55E" size={scale(14)} />
            </TouchableOpacity>
          </View>

          {/* Price grid */}
          <View style={{ gap: scale(10), marginBottom: vs(16) }}>
            {loading ? (
              <ActivityIndicator color="#22C55E" size="small" />
            ) : (
              <>
                <View style={{ flexDirection: "row", gap: scale(10) }}>
                  {categories.slice(0, 2).map((cat, idx) => {
                    const iconConfig = getCategoryIcon(cat.display_order);
                    const price = formatPrice(cat.price_min) + " - " + formatPrice(cat.price_max) + "/" + cat.unit;
                    return (
                      <PriceItem 
                        key={cat.id}
                        iconBg={iconConfig.iconBg} 
                        name={cat.name} 
                        price={price}
                        iconChild={iconConfig.iconChild}
                      />
                    );
                  })}
                </View>
                {categories.length > 2 && (
                  <View style={{ flexDirection: "row", gap: scale(10) }}>
                    {categories.slice(2, 4).map((cat, idx) => {
                      const iconConfig = getCategoryIcon(cat.display_order);
                      const price = formatPrice(cat.price_min) + " - " + formatPrice(cat.price_max) + "/" + cat.unit;
                      return (
                        <PriceItem 
                          key={cat.id}
                          iconBg={iconConfig.iconBg} 
                          name={cat.name} 
                          price={price}
                          iconChild={iconConfig.iconChild}
                        />
                      );
                    })}
                  </View>
                )}
              </>
            )}
          </View>

          {/* Tips banner */}
          <TouchableOpacity style={[styles.tipsBanner, { borderRadius: scale(16), padding: scale(18) }]}>
            <View style={{ flex: 1 }}>
              <Text
                allowFontScaling={false}
                style={{ ...typo.bodyBold, color: "white", marginBottom: vs(4) }}
              >
                Mẹo phân loại rác
              </Text>
              <Text
                allowFontScaling={false}
                style={{ ...typo.caption, color: "rgba(255,255,255,0.85)", fontWeight: "400" }}
              >
                Phân loại đúng cách giúp bảo vệ môi trường{"\n"}và bán được giá cao hơn.
              </Text>
            </View>
            <View style={[styles.tipsArrow, { width: scale(40), height: scale(40), borderRadius: scale(20) }]}>
              <ArrowRightIcon color="white" size={scale(18)} />
            </View>
          </TouchableOpacity>

          <View style={{ height: vs(24) }} />
        </View>
      </ScrollView>

      {/* ── Bottom navigation ── */}
      <View style={[styles.bottomNav, { paddingBottom: vs(16) }]}>
        <TouchableOpacity style={styles.navItem}>
          <HomeNavIcon active />
          <Text style={[styles.navLabel, { color: "#22C55E" }]}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <HistoryNavIcon />
          <Text style={styles.navLabel}>Lịch sử</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <ProfileNavIcon />
          <Text style={styles.navLabel}>Cá nhân</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Static styles (non-dimensional values) ────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
  },
  header: {
    backgroundColor: "#22C55E",
  },
  bellBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  bookingCard: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    gap: 6,
  },
  readyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FB8C00",
  },
  plusBtn: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaBtn: {
    backgroundColor: "#22C55E",
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsBanner: {
    backgroundColor: "#22C55E",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  tipsArrow: {
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9E9E9E",
  },
});
