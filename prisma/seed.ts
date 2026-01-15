import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Smart Code Generator
function generateCode(name: string, district: string): string {
    const overrides: Record<string, string> = {
        // District HQs
        "Thiruvananthapuram": "TVM", "Kollam": "KLM", "Pathanamthitta": "PTA", "Alappuzha": "ALP",
        "Kottayam": "KTM", "Idukki": "IDK", "Ernakulam": "ERN", "Thrissur": "TCR", "Palakkad": "PKD",
        "Malappuram": "MLP", "Kozhikode": "CLT", "Wayanad": "WND", "Kannur": "KNR", "Kasargod": "KSD",

        // Major Hubs
        "Attingal": "ATG", "Neyyattinkara": "NYK", "Nedumangad": "NMG",
        "Kottarakkara": "KKR", "Karunagappally": "KPY", "Punalur": "PNL",
        "Thiruvalla": "TVL", "Adoor": "ADR", "Ranni": "RNI",
        "Cherthala": "CTL", "Kayamkulam": "KYK", "Mavelikkara": "MVK",
        "Changanassery": "CHY", "Pala": "PLA", "Vaikom": "VKM",
        "Thodupuzha": "TDP", "Adimali": "ADL", "Kattappana": "KPN",
        "Aluva": "ALU", "Muvattupuzha": "MVP", "Tripunithura": "TRP",
        "Chalakudy": "CKD", "Kunnamkulam": "KNK", "Irinjalakuda": "IJK",
        "Ottapalam": "OTP", "Mannarkkad": "MNK", "Chittur": "CTR",
        "Tirur": "TIR", "Perinthalmanna": "PMN", "Manjeri": "MNJ",
        "Vadakara": "VDK", "Thamarassery": "TMY", "Ramanattukara": "RMK",
        "Kalpetta": "KPT", "Sulthan Bathery": "SBY", "Mananthavady": "MDY",
        "Thalassery": "TLY", "Taliparamba": "TPB", "Iritty": "ITY",
        "Kanhangad": "KGD", "Uppala": "UPL", "Cheruvathur": "CVR"
    };

    if (overrides[name]) return overrides[name];

    const clean = name.toUpperCase().replace(/[^A-Z]/g, '');
    let code = clean.substring(0, 3);

    // Improve logic for common prefixes like 'PU', 'KA' if needed, but simplistic is fine for now
    if (code.length < 3) code = code.padEnd(3, 'X');
    return code;
}

const keralaData: Record<string, { name: string, pincode: string }[]> = {
    "Thiruvananthapuram": [
        { name: "Thiruvananthapuram GPO", pincode: "695001" }, { name: "Attingal", pincode: "695101" }, { name: "Neyyattinkara", pincode: "695121" }, { name: "Nedumangad", pincode: "695541" },
        { name: "Kazhakkoottam", pincode: "695582" }, { name: "Pettah", pincode: "695024" }, { name: "Kowdiar", pincode: "695003" }, { name: "Varkala", pincode: "695141" },
        { name: "Parassala", pincode: "695502" }, { name: "Kilimanoor", pincode: "695601" }, { name: "Pothencode", pincode: "695584" }, { name: "Sreekariyam", pincode: "695017" },
        { name: "Vattiyoorkavu", pincode: "695013" }, { name: "Peroorkada", pincode: "695005" }, { name: "Karamana", pincode: "695002" }, { name: "Nemom", pincode: "695020" },
        { name: "Kattakada", pincode: "695572" }, { name: "Balaramapuram", pincode: "695501" }, { name: "Vizhinjam", pincode: "695521" }, { name: "Kovalam", pincode: "695527" },
        { name: "Malayinkeezhu", pincode: "695571" }, { name: "Peyad", pincode: "695573" }, { name: "Vellanad", pincode: "695543" }, { name: "Venjaramoodu", pincode: "695607" },
        { name: "Kaniyapuram", pincode: "695301" }, { name: "Mangalapuram", pincode: "695317" }, { name: "Chirayinkeezhu", pincode: "695304" }, { name: "Kadakkavoor", pincode: "695306" },
        { name: "Kallambalam", pincode: "695605" }, { name: "Vembayam", pincode: "695615" }, { name: "Palode", pincode: "695562" }, { name: "Vithura", pincode: "695551" },
        { name: "Ponmudi", pincode: "695551" }, { name: "Aryanad", pincode: "695542" }, { name: "Poovar", pincode: "695525" }, { name: "Kanjiramkulam", pincode: "695524" },
        { name: "Udiyankulangara", pincode: "695122" }, { name: "Amaravila", pincode: "695122" }, { name: "Marayamuttom", pincode: "695124" }, { name: "Vellarada", pincode: "695505" }
    ],
    "Kollam": [
        { name: "Kollam HO", pincode: "691001" }, { name: "Kottarakkara", pincode: "691506" }, { name: "Karunagappally", pincode: "690518" }, { name: "Punalur", pincode: "691305" },
        { name: "Chathannoor", pincode: "691572" }, { name: "Paravur", pincode: "691301" }, { name: "Pathanapuram", pincode: "689695" }, { name: "Sasthamcotta", pincode: "690521" },
        { name: "Kundara", pincode: "691501" }, { name: "Anchal", pincode: "691306" }, { name: "Chadayamangalam", pincode: "691534" }, { name: "Oachira", pincode: "690526" },
        { name: "Chavara", pincode: "691583" }, { name: "Kadakkal", pincode: "691536" }, { name: "Kilikollur", pincode: "691004" }, { name: "Eravipuram", pincode: "691011" },
        { name: "Mayyanad", pincode: "691303" }, { name: "Perinad", pincode: "691601" }, { name: "East Kallada", pincode: "691502" }, { name: "West Kallada", pincode: "691500" },
        { name: "Sooranad", pincode: "690522" }, { name: "Kunnathur", pincode: "690540" }, { name: "Thrikkadavoor", pincode: "691601" }, { name: "Sakthikulangara", pincode: "691581" },
        { name: "Thenmala", pincode: "691308" }, { name: "Aryankavu", pincode: "691309" }, { name: "Kulathupuzha", pincode: "691310" }, { name: "Yeroor", pincode: "691312" },
        { name: "Ayoor", pincode: "691533" }, { name: "Nilamel", pincode: "691535" }, { name: "Parippally", pincode: "691574" }, { name: "Kallambalam", pincode: "695605" },
        { name: "Odanavattom", pincode: "691512" }, { name: "Veliyam", pincode: "691540" }, { name: "Ezhukone", pincode: "691505" }
    ],
    "Pathanamthitta": [
        { name: "Pathanamthitta HO", pincode: "689645" }, { name: "Thiruvalla", pincode: "689101" }, { name: "Adoor", pincode: "691523" }, { name: "Ranni", pincode: "689672" },
        { name: "Pandalam", pincode: "689501" }, { name: "Konni", pincode: "689691" }, { name: "Kozhencherry", pincode: "689641" }, { name: "Mallappally", pincode: "689585" },
        { name: "Aranmula", pincode: "689533" }, { name: "Kumbanad", pincode: "689547" }, { name: "Pullad", pincode: "689548" }, { name: "Parumala", pincode: "689626" },
        { name: "Mannar", pincode: "689622" }, { name: "Enathy", pincode: "691526" }, { name: "Kodumon", pincode: "691555" }, { name: "Ezhamkulam", pincode: "691554" },
        { name: "Kalanjoor", pincode: "689694" }, { name: "Gavi", pincode: "685565" }, { name: "Seethathode", pincode: "689667" }, { name: "Chittar", pincode: "689663" },
        { name: "Vadasserikkara", pincode: "689662" }, { name: "Perunad", pincode: "689711" }, { name: "Vechoochira", pincode: "686511" }, { name: "Eraviperoor", pincode: "689542" },
        { name: "Maramon", pincode: "689549" }, { name: "Ayroor", pincode: "689611" }, { name: "Thelliyoór", pincode: "689544" }, { name: "Vennikulam", pincode: "689544" },
        { name: "Kuttoor", pincode: "689106" }, { name: "Podiyadi", pincode: "689110" }, { name: "Niranam", pincode: "689621" }, { name: "Kadapra", pincode: "689547" }
    ],
    "Alappuzha": [
        { name: "Alappuzha HO", pincode: "688001" }, { name: "Cherthala", pincode: "688524" }, { name: "Kayamkulam", pincode: "690502" }, { name: "Mavelikkara", pincode: "690101" },
        { name: "Chengannur", pincode: "689121" }, { name: "Haripad", pincode: "690514" }, { name: "Ambalapuzha", pincode: "688561" }, { name: "Aroor", pincode: "688534" },
        { name: "Edathua", pincode: "689573" }, { name: "Thuravoor", pincode: "688532" }, { name: "Kuttanad", pincode: "688501" }, { name: "Moncompu", pincode: "688502" },
        { name: "Champad", pincode: "689124" }, { name: "Pulincunnoo", pincode: "688504" }, { name: "Kavalam", pincode: "688506" }, { name: "Ramankary", pincode: "689595" },
        { name: "Thakazhy", pincode: "688562" }, { name: "Punnapra", pincode: "688004" }, { name: "Kalavoor", pincode: "688522" }, { name: "Mannancherry", pincode: "688538" },
        { name: "Muhamma", pincode: "688525" }, { name: "Thanneermukkom", pincode: "688527" }, { name: "Pattanakkad", pincode: "688531" }, { name: "Kuthiathode", pincode: "688533" },
        { name: "Ezhupunna", pincode: "688537" }, { name: "Charummood", pincode: "690505" }, { name: "Nooranad", pincode: "690504" }, { name: "Vallikunnam", pincode: "690501" },
        { name: "Krishnapuram", pincode: "690533" }, { name: "Karatte", pincode: "690101" }, { name: "Chettikulangara", pincode: "690106" }, { name: "Mannar", pincode: "689622" }
    ],
    "Kottayam": [
        { name: "Kottayam HO", pincode: "686001" }, { name: "Changanassery", pincode: "686101" }, { name: "Pala", pincode: "686575" }, { name: "Vaikom", pincode: "686141" },
        { name: "Ettumanoor", pincode: "686631" }, { name: "Kanjirappally", pincode: "686507" }, { name: "Erattupetta", pincode: "686121" }, { name: "Pampady", pincode: "686502" },
        { name: "Mundakayam", pincode: "686513" }, { name: "Kuravilangad", pincode: "686633" }, { name: "Ramapuram", pincode: "686576" }, { name: "Chingavanam", pincode: "686531" },
        { name: "Kumarakom", pincode: "686563" }, { name: "Ayarkunnam", pincode: "686564" }, { name: "Manarcad", pincode: "686019" }, { name: "Puthuppally", pincode: "686011" },
        { name: "Karukachal", pincode: "686540" }, { name: "Vazhoor", pincode: "686504" }, { name: "Ponkunnam", pincode: "686506" }, { name: "Manimala", pincode: "686543" },
        { name: "Teekoy", pincode: "686580" }, { name: "Poonjar", pincode: "686581" }, { name: "Bharananganam", pincode: "686578" }, { name: "Kidangoor", pincode: "686572" },
        { name: "Uzhavoor", pincode: "686634" }, { name: "Monipally", pincode: "686636" }, { name: "Kaduthuruthy", pincode: "686604" }, { name: "Thalayolaparambu", pincode: "686605" }
    ],
    "Idukki": [
        { name: "Thodupuzha", pincode: "685584" }, { name: "Munnar", pincode: "685612" }, { name: "Adimali", pincode: "685561" }, { name: "Kattappana", pincode: "685508" },
        { name: "Painavu", pincode: "685603" }, { name: "Nedumkandam", pincode: "685553" }, { name: "Kumily", pincode: "685509" }, { name: "Peermade", pincode: "685531" },
        { name: "Vandiperiyar", pincode: "685533" }, { name: "Rajakkad", pincode: "685566" }, { name: "Murickassery", pincode: "685604" }, { name: "Cheruthoni", pincode: "685602" },
        { name: "Moolamattom", pincode: "685589" }, { name: "Muttom", pincode: "685587" }, { name: "Karimannoor", pincode: "685581" }, { name: "Vannappuram", pincode: "685607" },
        { name: "Devikulam", pincode: "685613" }, { name: "Marayoor", pincode: "685620" }, { name: "Kanthalloor", pincode: "685620" }, { name: "Chithirapuram", pincode: "685565" },
        { name: "Vellathooval", pincode: "685563" }, { name: "Rajakumari", pincode: "685619" }, { name: "Udumbanchola", pincode: "685554" }, { name: "Vandanmedu", pincode: "685551" },
        { name: "Thekkady", pincode: "685509" }, { name: "Elappara", pincode: "685501" }, { name: "Kuttikkanam", pincode: "685531" }
    ],
    "Ernakulam": [
        { name: "Ernakulam HO", pincode: "682011" }, { name: "Aluva", pincode: "683101" }, { name: "Muvattupuzha", pincode: "686661" }, { name: "Tripunithura", pincode: "682301" },
        { name: "Kochi", pincode: "682001" }, { name: "Edappally", pincode: "682024" }, { name: "Kaloor", pincode: "682017" }, { name: "Vyttila", pincode: "682019" },
        { name: "Kakkanad", pincode: "682030" }, { name: "Angamaly", pincode: "683572" }, { name: "Perumbavoor", pincode: "683542" }, { name: "Kalamassery", pincode: "683104" },
        { name: "North Paravur", pincode: "683513" }, { name: "Kothamangalam", pincode: "686691" }, { name: "Piravom", pincode: "686664" }, { name: "Kolenchery", pincode: "682311" },
        { name: "Koothattukulam", pincode: "686662" }, { name: "Thoppumpady", pincode: "682005" }, { name: "Palluruthy", pincode: "682006" }, { name: "Mattancherry", pincode: "682002" },
        { name: "Eloor", pincode: "683501" }, { name: "Cherai", pincode: "683514" }, { name: "Njarakkal", pincode: "682505" }, { name: "Vypin", pincode: "682508" },
        { name: "Maradu", pincode: "682304" }, { name: "Thevara", pincode: "682013" }, { name: "Panampilly Nagar", pincode: "682036" }, { name: "Palarivattom", pincode: "682025" },
        { name: "Elamakkara", pincode: "682026" }, { name: "Pachalam", pincode: "682012" }, { name: "Pukkattupady", pincode: "683561" }, { name: "Kizhakkambalam", pincode: "683562" },
        { name: "Pattimattom", pincode: "683562" }, { name: "Mookkannoor", pincode: "683577" }, { name: "Kalady", pincode: "683574" }, { name: "Malayattoor", pincode: "683587" },
        { name: "Kuruppampady", pincode: "683545" }, { name: "Neriamangalam", pincode: "686693" }, { name: "Pothanicad", pincode: "686671" }, { name: "Vazhakulam", pincode: "686670" },
        { name: "Mulanthuruthy", pincode: "682314" }, { name: "Chottanikkara", pincode: "682312" }, { name: "Thiruvankulam", pincode: "682305" }, { name: "Puthencruz", pincode: "682308" },
        { name: "Ramamangalam", pincode: "686663" }, { name: "Pampakuda", pincode: "686667" }, { name: "Edakkattuvayal", pincode: "682313" }, { name: "Amballur", pincode: "682315" },
        { name: "Kanjiramattom", pincode: "682315" }
    ],
    "Thrissur": [
        { name: "Thrissur HO", pincode: "680001" }, { name: "Chalakudy", pincode: "680307" }, { name: "Kunnamkulam", pincode: "680503" }, { name: "Irinjalakuda", pincode: "680121" },
        { name: "Kodungallur", pincode: "680664" }, { name: "Guruvayur", pincode: "680101" }, { name: "Wadakkanchery", pincode: "680582" }, { name: "Chavakkad", pincode: "680506" },
        { name: "Pudukad", pincode: "680301" }, { name: "Triprayar", pincode: "680567" }, { name: "Ollur", pincode: "680306" }, { name: "Mannuthy", pincode: "680651" },
        { name: "Koratty", pincode: "680308" }, { name: "Mala", pincode: "680732" }, { name: "Ayyanthole", pincode: "680003" }, { name: "Viyyur", pincode: "680010" },
        { name: "Ramavarmapuram", pincode: "680631" }, { name: "Kuriachira", pincode: "680006" }, { name: "Koorkkenchery", pincode: "680007" }, { name: "Chelakkara", pincode: "680586" },
        { name: "Pazhayannur", pincode: "680587" }, { name: "Erumapetty", pincode: "680584" }, { name: "Kecheri", pincode: "680501" }, { name: "Mundur", pincode: "680541" },
        { name: "Kaipamangalam", pincode: "680981" }, { name: "Mathilakam", pincode: "680685" }, { name: "Vatanappally", pincode: "680614" }, { name: "Anthikad", pincode: "680641" },
        { name: "Kandassankadavu", pincode: "680613" }, { name: "Pavaratty", pincode: "680507" }, { name: "Mullassery", pincode: "680509" }, { name: "Athirappilly", pincode: "680721" },
        { name: "Kodakara", pincode: "680684" }
    ],
    "Palakkad": [
        { name: "Palakkad HO", pincode: "678001" }, { name: "Ottapalam", pincode: "679101" }, { name: "Mannarkkad", pincode: "678582" }, { name: "Chittur", pincode: "678101" },
        { name: "Pattambi", pincode: "679303" }, { name: "Shoranur", pincode: "679121" }, { name: "Alathur", pincode: "678541" }, { name: "Vadakkencherry", pincode: "678683" },
        { name: "Cherpulassery", pincode: "679503" }, { name: "Nemmara", pincode: "678508" }, { name: "Kollengode", pincode: "678506" }, { name: "Walayar", pincode: "678624" },
        { name: "Kanjikode", pincode: "678621" }, { name: "Malampuzha", pincode: "678651" }, { name: "Kongad", pincode: "678631" }, { name: "Parli", pincode: "678612" },
        { name: "Koppam", pincode: "679307" }, { name: "Ongallur", pincode: "679313" }, { name: "Thrithala", pincode: "679534" }, { name: "Koottanad", pincode: "679533" },
        { name: "Kozhinjampara", pincode: "678555" }, { name: "Vadakarapathy", pincode: "678557" }, { name: "Kuzhalmannam", pincode: "678702" }, { name: "Coyalmannam", pincode: "678702" },
        { name: "Agali", pincode: "678581" }, { name: "Attappadi", pincode: "678582" }, { name: "Alanallur", pincode: "678601" }
    ],
    "Malappuram": [
        { name: "Malappuram HO", pincode: "676505" }, { name: "Tirur", pincode: "676101" }, { name: "Perinthalmanna", pincode: "679322" }, { name: "Manjeri", pincode: "676121" },
        { name: "Nilambur", pincode: "679329" }, { name: "Kottakkal", pincode: "676503" }, { name: "Ponnani", pincode: "679577" }, { name: "Edappal", pincode: "679576" },
        { name: "Valanchery", pincode: "676552" }, { name: "Kondotty", pincode: "673638" }, { name: "Tanur", pincode: "676302" }, { name: "Tirurangadi", pincode: "676306" },
        { name: "Vengara", pincode: "676304" }, { name: "Areacode", pincode: "673639" }, { name: "Wandoor", pincode: "679328" }, { name: "Melattur", pincode: "679326" },
        { name: "Edavanna", pincode: "676541" }, { name: "Mampad", pincode: "676542" }, { name: "Changaramkulam", pincode: "679575" }, { name: "Kuttipuram", pincode: "679571" },
        { name: "Angadippuram", pincode: "679321" }, { name: "Makkaraparamba", pincode: "676507" }, { name: "Parappanangadi", pincode: "676303" }, { name: "Thenhipalam", pincode: "673636" },
        { name: "Chelari", pincode: "673636" }, { name: "Pandikkad", pincode: "676521" }, { name: "Karulai", pincode: "679330" }, { name: "Kalikavu", pincode: "676525" },
        { name: "Mankada", pincode: "679324" }, { name: "Kolathur", pincode: "679338" }, { name: "Pulamanthole", pincode: "679323" }, { name: "Vazhakkad", pincode: "673640" },
        { name: "Chemmad", pincode: "676306" }, { name: "Kadavallur", pincode: "680543" }, { name: "Vylathur", pincode: "679563" }, { name: "Tavanur", pincode: "679573" }
    ],
    "Kozhikode": [
        { name: "Kozhikode HO", pincode: "673001" }, { name: "Vadakara", pincode: "673101" }, { name: "Thamarassery", pincode: "673573" }, { name: "Ramanattukara", pincode: "673633" },
        { name: "Koyilandy", pincode: "673305" }, { name: "Feroke", pincode: "673631" }, { name: "Mukkam", pincode: "673602" }, { name: "Perambra", pincode: "673525" },
        { name: "Balussery", pincode: "673612" }, { name: "Koduvally", pincode: "673572" }, { name: "Kunnamangalam", pincode: "673571" }, { name: "Mavoor", pincode: "673661" },
        { name: "Nadapuram", pincode: "673504" }, { name: "Kuttiady", pincode: "673508" }, { name: "Beypore", pincode: "673015" }, { name: "Pantheerankavu", pincode: "673019" },
        { name: "Olavanna", pincode: "673025" }, { name: "Medical College", pincode: "673008" }, { name: "Elathur", pincode: "673303" }, { name: "Kakkodi", pincode: "673611" },
        { name: "Chelannur", pincode: "673616" }, { name: "Narikkuni", pincode: "673585" }, { name: "Elettil", pincode: "673572" }, { name: "Omassery", pincode: "673582" },
        { name: "Thiruvambady", pincode: "673603" }, { name: "Koodaranji", pincode: "673604" }, { name: "Meppayur", pincode: "673524" }, { name: "Payyoli", pincode: "673522" },
        { name: "Chombala", pincode: "673308" }, { name: "Orkkatteri", pincode: "673501" }, { name: "Thottilpalam", pincode: "673513" }
    ],
    "Wayanad": [
        { name: "Kalpetta", pincode: "673121" }, { name: "Sulthan Bathery", pincode: "673592" }, { name: "Mananthavady", pincode: "670645" }, { name: "Meppadi", pincode: "673577" },
        { name: "Vythiri", pincode: "673576" }, { name: "Pulpally", pincode: "673579" }, { name: "Panamaram", pincode: "670721" }, { name: "Padinjarathara", pincode: "673575" },
        { name: "Kambalakkad", pincode: "673122" }, { name: "Muttil", pincode: "673122" }, { name: "Kottathara", pincode: "673122" }, { name: "Vaduvanchal", pincode: "673581" },
        { name: "Ambalavayal", pincode: "673593" }, { name: "Meenanagadi", pincode: "673591" }, { name: "Kenichira", pincode: "673596" }, { name: "Vellamunda", pincode: "670731" },
        { name: "Kartikulam", pincode: "670646" }, { name: "Tholpetty", pincode: "670646" }, { name: "Boys Town", pincode: "670644" }
    ],
    "Kannur": [
        { name: "Kannur HO", pincode: "670001" }, { name: "Thalassery", pincode: "670101" }, { name: "Taliparamba", pincode: "670141" }, { name: "Iritty", pincode: "670703" },
        { name: "Payyannur", pincode: "670307" }, { name: "Mattannur", pincode: "670702" }, { name: "Kuthuparamba", pincode: "670643" }, { name: "Payyavoor", pincode: "670633" },
        { name: "Sreekandapuram", pincode: "670631" }, { name: "Panoor", pincode: "670692" }, { name: "Chakkarakkal", pincode: "670613" }, { name: "Dharmadam", pincode: "670106" },
        { name: "Edakkad", pincode: "670663" }, { name: "Chala", pincode: "670014" }, { name: "Pappinisseri", pincode: "670561" }, { name: "Valapattanam", pincode: "670010" },
        { name: "Alavil", pincode: "670008" }, { name: "Puthiyatheru", pincode: "670011" }, { name: "Mayyil", pincode: "670602" }, { name: "Irikkur", pincode: "670593" },
        { name: "Anjarakandy", pincode: "670612" }, { name: "Peravoor", pincode: "670673" }, { name: "Kelakam", pincode: "670674" }, { name: "Alakode", pincode: "670571" },
        { name: "Cherupuzha", pincode: "670511" }, { name: "Peringome", pincode: "670353" }, { name: "Pilathara", pincode: "670501" }, { name: "Pazhayangadi", pincode: "670303" }
    ],
    "Kasargod": [
        { name: "Kasargod HO", pincode: "671121" }, { name: "Kanhangad", pincode: "671315" }, { name: "Uppala", pincode: "671322" }, { name: "Cheruvathur", pincode: "671313" },
        { name: "Nileshwar", pincode: "671314" }, { name: "Manjeshwar", pincode: "671323" }, { name: "Trikarpur", pincode: "671310" }, { name: "Badiadka", pincode: "671551" },
        { name: "Mulleria", pincode: "671543" }, { name: "Kumbla", pincode: "671321" }, { name: "Mogral Puthur", pincode: "671124" }, { name: "Chengala", pincode: "671541" },
        { name: "Udma", pincode: "671319" }, { name: "Bekal", pincode: "671318" }, { name: "Periya", pincode: "671316" }, { name: "Vellarikundu", pincode: "671533" },
        { name: "Rajapuram", pincode: "671532" }, { name: "Chittarikkal", pincode: "671326" }
    ]
};

async function main() {
    console.log('🌱 Seeding Kerala Areas...');

    for (const [district, areas] of Object.entries(keralaData)) {
        console.log(`Processing ${district} (${areas.length} areas)...`);
        for (const area of areas) {
            const normalized = area.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
            const code = generateCode(area.name, district);

            await prisma.area.upsert({
                where: {
                    normalizedName_district: {
                        normalizedName: normalized,
                        district: district
                    }
                },
                update: {
                    code: code,
                    pincode: area.pincode
                },
                create: {
                    name: area.name,
                    normalizedName: normalized,
                    code: code,
                    pincode: area.pincode,
                    district: district,
                    state: "Kerala",
                    source: 'INDIA_POST',
                    isActive: true
                }
            });
            process.stdout.write('.');
        }
        console.log('\n');
    }
    console.log('✅ All Areas Seeded.');

    // Seed Super Admin
    const superAdminMobile = '9999999999';
    const adminExists = await prisma.user.findUnique({ where: { mobile: superAdminMobile } });

    if (!adminExists) {
        console.log('👑 Seeding Super Admin...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                mobile: superAdminMobile,
                role: 'SUPER_ADMIN',
                password: hashedPassword,
                status: 'ACTIVE',
                district: 'Thiruvananthapuram'
            }
        });
        console.log('✅ Super Admin Created.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
