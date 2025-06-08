--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

-- Started on 2025-06-08 21:02:04 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS neondb;
--
-- TOC entry 3426 (class 1262 OID 16389)
-- Name: neondb; Type: DATABASE; Schema: -; Owner: neondb_owner
--

CREATE DATABASE neondb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C.UTF-8';


ALTER DATABASE neondb OWNER TO neondb_owner;

\connect neondb

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 227 (class 1259 OID 32838)
-- Name: components; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.components (
    id integer NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    brand text,
    model text,
    specifications jsonb,
    price numeric(10,2) NOT NULL,
    stock_quantity integer DEFAULT 0,
    min_stock_level integer DEFAULT 5,
    location text,
    reference text,
    section text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.components OWNER TO neondb_owner;

--
-- TOC entry 226 (class 1259 OID 32837)
-- Name: components_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.components_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.components_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3428 (class 0 OID 0)
-- Dependencies: 226
-- Name: components_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.components_id_seq OWNED BY public.components.id;


--
-- TOC entry 216 (class 1259 OID 24577)
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inventory_items (
    id integer NOT NULL,
    name character varying NOT NULL,
    category character varying NOT NULL,
    model character varying NOT NULL,
    brand character varying,
    price numeric(10,2),
    stock_quantity integer DEFAULT 0 NOT NULL,
    min_stock_level integer DEFAULT 5 NOT NULL,
    specifications jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.inventory_items OWNER TO neondb_owner;

--
-- TOC entry 215 (class 1259 OID 24576)
-- Name: inventory_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.inventory_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_items_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3429 (class 0 OID 0)
-- Dependencies: 215
-- Name: inventory_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.inventory_items_id_seq OWNED BY public.inventory_items.id;


--
-- TOC entry 229 (class 1259 OID 40961)
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) DEFAULT 'info'::character varying NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    related_order_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- TOC entry 228 (class 1259 OID 40960)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3430 (class 0 OID 0)
-- Dependencies: 228
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 218 (class 1259 OID 24591)
-- Name: order_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    inventory_item_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.order_items OWNER TO neondb_owner;

--
-- TOC entry 217 (class 1259 OID 24590)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3431 (class 0 OID 0)
-- Dependencies: 217
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 220 (class 1259 OID 24600)
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.order_status_history (
    id integer NOT NULL,
    order_id integer NOT NULL,
    status character varying NOT NULL,
    user_id character varying NOT NULL,
    notes text,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.order_status_history OWNER TO neondb_owner;

--
-- TOC entry 219 (class 1259 OID 24599)
-- Name: order_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.order_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_status_history_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3432 (class 0 OID 0)
-- Dependencies: 219
-- Name: order_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.order_status_history_id_seq OWNED BY public.order_status_history.id;


--
-- TOC entry 222 (class 1259 OID 24610)
-- Name: orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_number character varying NOT NULL,
    customer_id character varying NOT NULL,
    status character varying DEFAULT 'created'::character varying NOT NULL,
    current_assignee_id character varying,
    total_amount numeric(10,2),
    specifications jsonb,
    notes text,
    tracking_number character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO neondb_owner;

--
-- TOC entry 221 (class 1259 OID 24609)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3433 (class 0 OID 0)
-- Dependencies: 221
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 223 (class 1259 OID 24623)
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- TOC entry 225 (class 1259 OID 32824)
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- TOC entry 224 (class 1259 OID 32823)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- TOC entry 3434 (class 0 OID 0)
-- Dependencies: 224
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3233 (class 2604 OID 32841)
-- Name: components id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.components ALTER COLUMN id SET DEFAULT nextval('public.components_id_seq'::regclass);


--
-- TOC entry 3214 (class 2604 OID 24580)
-- Name: inventory_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory_items ALTER COLUMN id SET DEFAULT nextval('public.inventory_items_id_seq'::regclass);


--
-- TOC entry 3238 (class 2604 OID 40964)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3220 (class 2604 OID 24594)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 3223 (class 2604 OID 24603)
-- Name: order_status_history id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_status_history ALTER COLUMN id SET DEFAULT nextval('public.order_status_history_id_seq'::regclass);


--
-- TOC entry 3225 (class 2604 OID 24613)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 3229 (class 2604 OID 32827)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3418 (class 0 OID 32838)
-- Dependencies: 227
-- Data for Name: components; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.components (id, name, type, brand, model, specifications, price, stock_quantity, min_stock_level, location, reference, section, is_active, created_at) FROM stdin;
31	GTX 3060 ti 8GB VRAM	GPU	NVIDIA	5060 ti	""	300.00	30	5	A1	GPU-081	\N	t	2025-06-08 09:46:54.72
29	Corsair RM850x 850W 80+ Gold	Power Supply	Corsair	RM850x	""	149.99	15	5	Étagère F1	PSU-COR-001	Alimentations	t	2025-06-06 15:43:08.166255
30	Seasonic Focus GX-750 750W 80+ Gold	Power Supply	Seasonic	Focus GX-750	""	119.99	18	5	Étagère F1	PSU-SEA-001	Alimentations	t	2025-06-06 15:43:08.166255
13	AMD RX 7600	GPU	AMD	RX 7600	""	269.99	22	5	Armoire B4	GPU-AMD-003	Cartes Graphiques	t	2025-06-06 15:43:08.166255
11	AMD RX 7800 XT	GPU	AMD	RX 7800 XT	""	549.99	10	5	Armoire B3	GPU-AMD-002	Cartes Graphiques	t	2025-06-06 15:43:08.166255
9	AMD RX 7900 XTX	GPU	AMD	RX 7900 XTX	""	999.99	6	5	Armoire B2	GPU-AMD-001	Cartes Graphiques	t	2025-06-06 15:43:08.166255
14	NVIDIA RTX 4060	GPU	NVIDIA	RTX 4060	""	299.99	18	5	Armoire B4	GPU-NV-005	Cartes Graphiques	t	2025-06-06 15:43:08.166255
12	NVIDIA RTX 4060 Ti	GPU	NVIDIA	RTX 4060 Ti	""	399.99	15	5	Armoire B3	GPU-NV-004	Cartes Graphiques	t	2025-06-06 15:43:08.166255
10	NVIDIA RTX 4070 Ti	GPU	NVIDIA	RTX 4070 Ti	""	799.99	12	5	Armoire B2	GPU-NV-003	Cartes Graphiques	t	2025-06-06 15:43:08.166255
8	NVIDIA RTX 4080	GPU	NVIDIA	RTX 4080	""	1199.99	8	5	Armoire B1	GPU-NV-002	Cartes Graphiques	t	2025-06-06 15:43:08.166255
7	NVIDIA RTX 4090	GPU	NVIDIA	RTX 4090	""	1599.99	5	5	Armoire B1	GPU-NV-001	Cartes Graphiques	t	2025-06-06 15:43:08.166255
26	ASUS ROG Strix X670E-E	Motherboard	ASUS	ROG Strix X670E-E	""	499.99	8	5	Étagère E1	MB-ASU-001	Cartes Mères	t	2025-06-06 15:43:08.166255
28	Gigabyte Z790 AORUS Elite	Motherboard	Gigabyte	Z790 AORUS Elite	""	299.99	10	5	Étagère E2	MB-GIG-001	Cartes Mères	t	2025-06-06 15:43:08.166255
27	MSI MAG B650 Tomahawk	Motherboard	MSI	MAG B650 Tomahawk	""	199.99	12	5	Étagère E2	MB-MSI-001	Cartes Mères	t	2025-06-06 15:43:08.166255
18	Corsair Vengeance DDR4-3200 32GB	Memory	Corsair	Vengeance DDR4	""	99.99	40	5	Tiroir C2	RAM-COR-002	Mémoire	t	2025-06-06 15:43:08.166255
15	Corsair Vengeance DDR5-5600 32GB	Memory	Corsair	Vengeance DDR5	""	159.99	30	5	Tiroir C1	RAM-COR-001	Mémoire	t	2025-06-06 15:43:08.166255
19	G.Skill Ripjaws V DDR4-3600 32GB	Memory	G.Skill	Ripjaws V	""	109.99	28	5	Tiroir C3	RAM-GSK-002	Mémoire	t	2025-06-06 15:43:08.166255
16	G.Skill Trident Z5 DDR5-6000 32GB	Memory	G.Skill	Trident Z5	""	179.99	25	5	Tiroir C1	RAM-GSK-001	Mémoire	t	2025-06-06 15:43:08.166255
17	Kingston Fury Beast DDR5-5200 32GB	Memory	Kingston	Fury Beast	""	139.99	35	5	Tiroir C2	RAM-KIN-001	Mémoire	t	2025-06-06 15:43:08.166255
5	AMD Ryzen 5 7600X	CPU	AMD	7600X	""	299.99	25	5	Étagère A3	CPU-AMD-003	Processeurs	t	2025-06-06 15:43:08.166255
3	AMD Ryzen 7 7800X3D	CPU	AMD	7800X3D	""	449.99	8	5	Étagère A2	CPU-AMD-002	Processeurs	t	2025-06-06 15:43:08.166255
1	AMD Ryzen 9 7950X	CPU	AMD	7950X	""	699.99	15	5	Étagère A1	CPU-AMD-001	Processeurs	t	2025-06-06 15:43:08.166255
4	Intel Core i7-13700K	CPU	Intel	i7-13700K	""	409.99	20	5	Étagère A2	CPU-INT-002	Processeurs	t	2025-06-06 15:43:08.166255
6	Intel Core i5-13600K	CPU	Intel	i5-13600K	""	319.99	18	5	Étagère A3	CPU-INT-003	Processeurs	t	2025-06-06 15:43:08.166255
2	Intel Core i9-13900K	CPU	Intel	i9-13900K	""	589.99	12	5	Étagère A1	CPU-INT-001	Processeurs	t	2025-06-06 15:43:08.166255
22	Crucial P5 Plus 1TB NVMe	Storage	Crucial	P5 Plus	""	89.99	30	5	Casier D2	SSD-CRU-001	Stockage	t	2025-06-06 15:43:08.166255
25	Samsung 970 EVO Plus 500GB	Storage	Samsung	970 EVO Plus	""	69.99	40	5	Casier D2	SSD-SAM-002	Stockage	t	2025-06-06 15:43:08.166255
20	Samsung 980 PRO 2TB NVMe	Storage	Samsung	980 PRO	""	199.99	20	5	Casier D1	SSD-SAM-001	Stockage	t	2025-06-06 15:43:08.166255
23	Seagate FireCuda 2TB HDD	Storage	Seagate	FireCuda	""	79.99	15	5	Casier D3	HDD-SEA-001	Stockage	t	2025-06-06 15:43:08.166255
21	WD Black SN850X 1TB NVMe	Storage	Western Digital	SN850X	""	129.99	25	5	Casier D1	SSD-WD-001	Stockage	t	2025-06-06 15:43:08.166255
24	WD Blue 1TB HDD	Storage	Western Digital	Blue	""	49.99	35	5	Casier D3	HDD-WD-001	Stockage	t	2025-06-06 15:43:08.166255
\.


--
-- TOC entry 3407 (class 0 OID 24577)
-- Dependencies: 216
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inventory_items (id, name, category, model, brand, price, stock_quantity, min_stock_level, specifications, is_active, created_at, updated_at) FROM stdin;
1	Intel Core i9-13900K	CPU	i9-13900K	Intel	599.99	15	3	{"cores": 24, "socket": "LGA1700", "location": "Étagère A1"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
2	AMD Ryzen 9 7950X	CPU	7950X	AMD	649.99	12	3	{"cores": 16, "socket": "AM5", "location": "Étagère A2"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
3	NVIDIA RTX 4090	GPU	RTX 4090	NVIDIA	1699.99	8	2	{"power": "450W", "memory": "24GB GDDR6X", "location": "Étagère B1"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
4	AMD RX 7900 XTX	GPU	RX 7900 XTX	AMD	999.99	10	2	{"power": "355W", "memory": "24GB GDDR6", "location": "Étagère B2"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
5	NVIDIA RTX 4080	GPU	RTX 4080	NVIDIA	1199.99	6	2	{"power": "320W", "memory": "16GB GDDR6X", "location": "Étagère B3"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
6	Corsair Vengeance DDR5-5600	RAM	CMK32GX5M2B5600C36	Corsair	189.99	25	5	{"speed": "5600MHz", "capacity": "32GB", "location": "Tiroir C1"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
7	G.Skill Trident Z5 DDR5-6000	RAM	F5-6000J3636F16GX2-TZ5K	G.Skill	219.99	20	5	{"speed": "6000MHz", "capacity": "32GB", "location": "Tiroir C2"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
8	Samsung 980 PRO 2TB	Storage	980 PRO	Samsung	199.99	18	4	{"capacity": "2TB", "location": "Tiroir D1", "interface": "NVMe PCIe 4.0"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
9	WD Black SN850X 1TB	Storage	SN850X	Western Digital	129.99	22	4	{"capacity": "1TB", "location": "Tiroir D2", "interface": "NVMe PCIe 4.0"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
10	Seagate FireCuda 530 4TB	Storage	FireCuda 530	Seagate	459.99	8	2	{"capacity": "4TB", "location": "Tiroir D3", "interface": "NVMe PCIe 4.0"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
11	ASUS ROG Strix Z790-E	Motherboard	ROG Strix Z790-E	ASUS	449.99	12	3	{"socket": "LGA1700", "chipset": "Z790", "location": "Étagère E1"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
12	MSI MAG B650 Tomahawk	Motherboard	MAG B650 Tomahawk	MSI	229.99	15	3	{"socket": "AM5", "chipset": "B650", "location": "Étagère E2"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
13	Corsair RM1000x	PSU	RM1000x	Corsair	179.99	14	3	{"modular": "Fully modular", "wattage": "1000W", "location": "Étagère F1"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
14	EVGA SuperNOVA 850 G6	PSU	SuperNOVA 850 G6	EVGA	149.99	16	3	{"modular": "Fully modular", "wattage": "850W", "location": "Étagère F2"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
15	Seasonic Focus GX-750	PSU	Focus GX-750	Seasonic	119.99	18	4	{"modular": "Fully modular", "wattage": "750W", "location": "Étagère F3"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
16	Fractal Design Define 7	Case	Define 7	Fractal Design	169.99	10	2	{"type": "Full Tower", "color": "Black", "location": "Zone G1"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
17	Lian Li PC-O11 Dynamic	Case	PC-O11 Dynamic	Lian Li	139.99	8	2	{"type": "Mid Tower", "color": "White", "location": "Zone G2"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
18	NZXT H7 Flow	Case	H7 Flow	NZXT	129.99	12	2	{"type": "Mid Tower", "color": "Black", "location": "Zone G3"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
19	Noctua NH-D15	Cooling	NH-D15	Noctua	99.99	20	4	{"type": "Air Cooler", "socket": "Universal", "location": "Étagère H1"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
20	Corsair H100i RGB	Cooling	H100i RGB	Corsair	149.99	15	3	{"type": "AIO 240mm", "socket": "Universal", "location": "Étagère H2"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
21	Arctic Liquid Freezer II 280	Cooling	Liquid Freezer II 280	Arctic	89.99	18	4	{"type": "AIO 280mm", "socket": "Universal", "location": "Étagère H3"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
22	Corsair Vengeance LPX 16GB	RAM	CMK16GX4M2B3200C16	Corsair	79.99	30	6	{"speed": "3200MHz", "capacity": "16GB", "location": "Tiroir C3"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
23	Kingston Fury Beast 16GB	RAM	KF432C16BBK2/16	Kingston	69.99	25	5	{"speed": "3200MHz", "capacity": "16GB", "location": "Tiroir C4"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
24	Crucial MX4 1TB	Storage	MX4	Crucial	89.99	20	4	{"capacity": "1TB", "location": "Tiroir D4", "interface": "SATA SSD"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
25	WD Blue 4TB HDD	Storage	WD40EZAZ	Western Digital	89.99	15	3	{"capacity": "4TB", "location": "Tiroir D5", "interface": "SATA HDD"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
26	Intel Core i5-13600K	CPU	i5-13600K	Intel	329.99	20	4	{"cores": 14, "socket": "LGA1700", "location": "Étagère A3"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
27	AMD Ryzen 7 7700X	CPU	7700X	AMD	349.99	18	4	{"cores": 8, "socket": "AM5", "location": "Étagère A4"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
28	NVIDIA RTX 4070	GPU	RTX 4070	NVIDIA	599.99	12	3	{"power": "200W", "memory": "12GB GDDR6X", "location": "Étagère B4"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
29	Be Quiet! Dark Rock Pro 4	Cooling	Dark Rock Pro 4	Be Quiet!	79.99	22	4	{"type": "Air Cooler", "socket": "Universal", "location": "Étagère H4"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
30	Cooler Master MasterBox TD500	Case	MasterBox TD500	Cooler Master	99.99	14	3	{"type": "Mid Tower", "color": "Black", "location": "Zone G4"}	t	2025-06-06 00:26:12.954826	2025-06-06 00:26:12.954826
\.


--
-- TOC entry 3420 (class 0 OID 40961)
-- Dependencies: 229
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, user_id, title, message, type, is_read, related_order_id, created_at) FROM stdin;
\.


--
-- TOC entry 3409 (class 0 OID 24591)
-- Dependencies: 218
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.order_items (id, order_id, inventory_item_id, quantity, unit_price, created_at) FROM stdin;
\.


--
-- TOC entry 3411 (class 0 OID 24600)
-- Dependencies: 220
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.order_status_history (id, order_id, status, user_id, notes, "timestamp") FROM stdin;
\.


--
-- TOC entry 3413 (class 0 OID 24610)
-- Dependencies: 222
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.orders (id, order_number, customer_id, status, current_assignee_id, total_amount, specifications, notes, tracking_number, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3414 (class 0 OID 24623)
-- Dependencies: 223
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
s2d00kl9xfRXi9Dz976UA1sYj-pz68XT	{"cookie": {"path": "/", "secure": true, "expires": "2025-06-12T23:54:58.814Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "owhmTtXunPbzlkLrJFW1glGKRNEwl3vHEPY6ZVuNu30"}}	2025-06-12 23:54:59
7pb7VPlK74gjTzAe0RO5NH90p-N-fvPG	{"cookie": {"path": "/", "secure": true, "expires": "2025-06-13T00:38:37.382Z", "httpOnly": true, "originalMaxAge": 604800000}, "employeeUser": {"id": "reception", "role": "receptionist", "email": "reception@ultrapc.com", "lastName": "Réception", "firstName": "Employé"}}	2025-06-13 00:38:42
EqBh-KXsHjagqEzPQ6AAfEKXCp5Zz8F_	{"cookie": {"path": "/", "secure": true, "expires": "2025-06-13T15:20:45.634Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "56f6736e-8ed1-4179-8084-bde5d358e99c", "exp": 1749226845, "iat": 1749223245, "iss": "https://replit.com/oidc", "sub": "43522189", "email": "pavla.nedomova@volny.cz", "at_hash": "7rBFiTKO9ZZWJhfVlFnDcg", "username": "pavlanedomova", "auth_time": 1749168157, "last_name": "Cate", "first_name": "Cynthia"}, "expires_at": 1749226845, "access_token": "2xlEBbfNU5ECmkvMsZ4DSjQD9gc3ZjHy6x2N8ZnLbJ9", "refresh_token": "PA7rk3fhok79AEd2TANJRDFI-epBXv2HAeM0kkD5tPv"}}}	2025-06-13 15:23:47
\.


--
-- TOC entry 3416 (class 0 OID 32824)
-- Dependencies: 225
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at) FROM stdin;
5	emballage@ultrapc.com	$2b$10$/jgFarbNZjGFFheVpPFPv./7ioQLfSdTePX/RXeTBnbLALBKmGxQe	Employé	Emballage	packaging	t	2025-06-06 15:42:08.734718	2025-06-06 15:42:08.734718
6	expedition@ultrapc.com	$2b$10$6bfw3XKmkIAB1Oxsb9qMHOKOHv8e3.tEkKI94GF3t3MqeN.7m.BmO	Employé	Expédition	shipping	t	2025-06-06 15:42:08.734718	2025-06-06 15:42:08.734718
4	composants@ultrapc.com	$2b$10$8Qi/843G7YO64rc9K/P.OehWen3RH4d4rfp5hJyC.5q9U5Xxg4WZ6	Responsable	Composants	stock_manager	t	2025-06-06 15:42:08.734718	2025-06-06 15:42:08.734718
1	admin@ultrapc.com	$2b$10$of/NGPk34i2fMPNUSxj/X.065QvdqXwOs6HzOw3FAGKOalmbjgyVW	Administrateur	Hamza	admin	t	2025-06-06 15:42:08.734718	2025-06-08 10:32:12.053
3	reception@ultrapc.com	$2b$10$HdSRdO198d9y91XGqXTn1.aaGk1eEltyG1JG08P6JWMdO60qYIj06	Réception	Ayman	receptionist	t	2025-06-06 15:42:08.734718	2025-06-08 13:31:35.42
2	montage@ultrapc.com	$2b$10$piIvoHFVLeRhiQubqbDKc.EvTt92Biq5GxG/BIS8n9fLLReDfJaqi	Montage	Hicham	assembly	t	2025-06-06 15:42:08.734718	2025-06-08 13:33:14.451
\.


--
-- TOC entry 3435 (class 0 OID 0)
-- Dependencies: 226
-- Name: components_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.components_id_seq', 31, true);


--
-- TOC entry 3436 (class 0 OID 0)
-- Dependencies: 215
-- Name: inventory_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.inventory_items_id_seq', 30, true);


--
-- TOC entry 3437 (class 0 OID 0)
-- Dependencies: 228
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 3438 (class 0 OID 0)
-- Dependencies: 217
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- TOC entry 3439 (class 0 OID 0)
-- Dependencies: 219
-- Name: order_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.order_status_history_id_seq', 1, false);


--
-- TOC entry 3440 (class 0 OID 0)
-- Dependencies: 221
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- TOC entry 3441 (class 0 OID 0)
-- Dependencies: 224
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- TOC entry 3260 (class 2606 OID 32849)
-- Name: components components_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.components
    ADD CONSTRAINT components_pkey PRIMARY KEY (id);


--
-- TOC entry 3243 (class 2606 OID 24589)
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3262 (class 2606 OID 40971)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3245 (class 2606 OID 24598)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3247 (class 2606 OID 24608)
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- TOC entry 3249 (class 2606 OID 24622)
-- Name: orders orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);


--
-- TOC entry 3251 (class 2606 OID 24620)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3254 (class 2606 OID 24629)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- TOC entry 3256 (class 2606 OID 32836)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3258 (class 2606 OID 32834)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3252 (class 1259 OID 24643)
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- TOC entry 3427 (class 0 OID 0)
-- Dependencies: 3426
-- Name: DATABASE neondb; Type: ACL; Schema: -; Owner: neondb_owner
--

GRANT ALL ON DATABASE neondb TO neon_superuser;


--
-- TOC entry 2073 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2072 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2025-06-08 21:02:12 UTC

--
-- PostgreSQL database dump complete
--

