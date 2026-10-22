YªçŠx-®éÜj×¢ëiºÚ+Š§j[h‘éÜ¢éíÛÎöã]tÓ<o+^²‰¢¶×import React, { useState, useEffect, useRef, useCallback } from "react";
import "./index.css";
import { PAGE_COPY, MEDIA_SELECTION } from "./content-refresh";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  Rectangle,
  TileLayer,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import AdminControlCenter from "./AdminControlCenter";

import {
  Bot,
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  X,
  Building2,
  Briefcase,
  Megaphone,
  TrendingUp,
  Key,
  Home,
  GraduationCap,
  ArrowRight,
  ArrowUp,
  Users,
  Navigation,
  UserCheck,
  Filter,
  Maximize2,
  Bed,
  Calendar,
  Tag,
  Flame,
  Send,
  Clock,
  MessageSquare,
  LogOut,
  PlusCircle,
  Settings,
  BarChart3,
  ShieldAlert,
  Lock,
  Check,
  AlertCircle,
  FileText,
  PieChart,
  Layers,
  MessageCircle,
  Menu,
  Heart,
  Printer,
  Share2,
  PlayCircle,
  Camera,
  Map,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LocateFixed,
  PencilRuler,
  RotateCcw,
  MapPinned,
  Flag,
  Bell,
  Music2,
  VolumeX,
  BookOpen,
  ShieldCheck,
  Star,
} from "lucide-react";

const STATIC_LANGUAGES = {
  tr: {
    corporate: "Kurumsal",
    offices: "Ofislerimiz"Û­uçkh‘éì¶»§q«^uÉ…›Åµ„‰¥±¥±•¹‘¥Éµ”°…É…µ„Ù”M5L(€€€€€€€€€€€€€€€€€€€ŸÙ¹‘•É¥±µ•Í¥¹¤­…‰Õ°•‘¥å½ÉÕ´¸(€€€€€€€€€€€€€€€€€€ð½±…‰•°ø(€€€€€€€€€€€€€€€€ð½‘¥Øø((€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰ÁÐ´Ìˆø(€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€€€ÑåÁ”ô‰ÍÕ‰µ¥Ðˆ(€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰É•±…Ñ¥Ù”½Ù•É™±½Üµ¡¥‘‘•¸É½ÕÀÜµ™Õ±°Áä´Ì¸Ô‰œµÉ•´ÜÀÀ¡½Ù•Èé‰œµÉ•´àÀÀÑ•áÐµÝ¡¥Ñ”™½¹Ðµ‰±…¬É½Õ¹‘•µ±œÍ¡…‘½Üµ±œÍ¡…‘½ÜµÉ•´ÜÀÀ¼ÌÀÑÉ…¹Í¥Ñ¥½¸™±•à¥Ñ•µÌµ•¹Ñ•È©ÕÍÑ¥™äµ•¹Ñ•ÈÍÁ…”µà´Èˆ(€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰É•±…Ñ¥Ù”è´ÄÀˆù	‡}ÙÕÉÕåÔQ…µ…µ±„ð½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€ñ¡•­¥É±”È±…ÍÍ9…µ”ô‰Ü´Ð ´ÐÉ•±…Ñ¥Ù”è´ÄÀˆ€¼ø(€€€€€€€€€€€€€€€€€€ð½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€ð½™½É´ø((€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Áà´ÔÁä´Ì‰œµÍ±…Ñ”´ÄÀÀ‰½É‘•ÈµÐ‰½É‘•ÈµÍ±…Ñ”´ÈÀÀÑ•áÐµ•¹Ñ•ÈÑ•áÐµlÄÁÁátÑ•áÐµÍ±…Ñ”´ÔÀÀ™½¹ÐµÍ•µ¥‰½±ˆø(€€€€€€€€€€€€€€€I•…±Ñä•¹Ñ•Ë
¸…åÉ¥µ•¹­Õ°É…¹¡¥Í”€˜…»Ç}µ…¸Ä(€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€ð½‘¥Øø(€€€€€€€€ð½‘¥Øø((€€€€€€€íÍ¡½ÝMÉ½±±Q½À€˜˜€ (€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€½¹±¥¬õíÍÉ½±±Q½Q½Áô(€€€€€€€€€€€…É¥„µ±…‰•°ô‰¸åÕ­…ËÅå„“Ù¸ˆ(€€€€€€€€€€€±…ÍÍ9…µ”ô‰™¥á•‰½ÑÑ½´´ÈÐÉ¥¡Ð´Øè´ÐÀ‰œµÉ•´ÜÀÀ¡½Ù•Èé‰œµÉ•´àÀÀÑ•áÐµÝ¡¥Ñ”À´Ì¸ÔÉ½Õ¹‘•µ™Õ±°Í¡…‘½Ü´Éá°Í¡…‘½ÜµÉ•´ÜÀÀ¼ÔÀÑÉ…¹Í¥Ñ¥½¸µ…±°‘ÕÉ…Ñ¥½¸´ÌÀÀÑÉ…¹Í™½É´¡½Ù•ÈéÍ…±”´ÄÄÀ¡½Ù•ÈèµÑÉ…¹Í±…Ñ”µä´Ä‰½É‘•È´È‰½É‘•ÈµÝ¡¥Ñ”¼ÈÀ™±•à¥Ñ•µÌµ•¹Ñ•È©ÕÍÑ¥™äµ•¹Ñ•Èˆ(€€€€€€€€€€ø(€€€€€€€€€€€€ñÉÉ½ÝUÀ±…ÍÍ9…µ”ô‰Ü´Ô ´Ôˆ€¼ø(€€€€€€€€€€ð½‰ÕÑÑ½¸ø(€€€€€€€€¥ô(€€€€€€ð½‘¥Øø(€€€€ð½I½ÕÑ•Èø(€€¤ì)ô(