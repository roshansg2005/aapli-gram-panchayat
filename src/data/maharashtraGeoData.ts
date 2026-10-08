export interface GramPanchayatOption {
  id: string;
  nameMr: string;
  nameEn: string;
  wards: string[];
}

export interface TalukaOption {
  id: string;
  nameMr: string;
  nameEn: string;
  panchayats: GramPanchayatOption[];
}

export interface DistrictOption {
  id: string;
  nameMr: string;
  nameEn: string;
  talukas: TalukaOption[];
}

export interface StateOption {
  id: string;
  nameMr: string;
  nameEn: string;
  districts: DistrictOption[];
}

export const maharashtraGeoData: StateOption[] = [
  {
    id: 'MH',
    nameMr: 'महाराष्ट्र (Maharashtra)',
    nameEn: 'Maharashtra',
    districts: [
      {
        id: 'pune',
        nameMr: 'पुणे (Pune)',
        nameEn: 'Pune',
        talukas: [
          {
            id: 'haveli',
            nameMr: 'हवेली (Haveli)',
            nameEn: 'Haveli',
            panchayats: [
              {
                id: 'shivane',
                nameMr: 'ग्रामपंचायत शिवणे (Shivane)',
                nameEn: 'Gram Panchayat Shivane',
                wards: ['Ward 1 (गणपती चौक)', 'Ward 2 (मारुती मंदिर)', 'Ward 3 (बाजारपेठ)', 'Ward 4 (आंबेडकर नगर)', 'Ward 5 (गावठाण)', 'Ward 6 (नवी वस्ती)']
              },
              {
                id: 'khadakwasla',
                nameMr: 'ग्रामपंचायत खडकवासला (Khadakwasla)',
                nameEn: 'Gram Panchayat Khadakwasla',
                wards: ['Ward 1 (धरण चौक)', 'Ward 2 (गावठाण)', 'Ward 3 (कुडळे वस्ती)', 'Ward 4 (मते वस्ती)']
              },
              {
                id: 'narhe',
                nameMr: 'ग्रामपंचायत नऱ्हे (Narhe)',
                nameEn: 'Gram Panchayat Narhe',
                wards: ['Ward 1 (स्वामीनारायण चौक)', 'Ward 2 (कॉलेज रोड)', 'Ward 3 (गावठाण)', 'Ward 4 (अंबिका नगर)']
              },
              {
                id: 'dhayari',
                nameMr: 'ग्रामपंचायत धायरी (Dhayari)',
                nameEn: 'Gram Panchayat Dhayari',
                wards: ['Ward 1 (धायरी फाटा)', 'Ward 2 (रायकर मळा)', 'Ward 3 (बेनकर वस्ती)', 'Ward 4 (गावठाण)']
              },
              {
                id: 'wagholi',
                nameMr: 'ग्रामपंचायत वाघोली (Wagholi)',
                nameEn: 'Gram Panchayat Wagholi',
                wards: ['Ward 1 (बायपास चौक)', 'Ward 2 (बाजारपेठ)', 'Ward 3 (बकोरी रोड)', 'Ward 4 (गावठाण)', 'Ward 5 (आव्हाळवाडी रोड)']
              },
              {
                id: 'khanapur',
                nameMr: 'ग्रामपंचायत खानापूर (Khanapur)',
                nameEn: 'Gram Panchayat Khanapur',
                wards: ['Ward 1 (गावठाण)', 'Ward 2 (माळवाडी)', 'Ward 3 (मल्हार चौक)']
              },
              {
                id: 'uruli_kanchan',
                nameMr: 'ग्रामपंचायत उरुळी कांचन (Uruli Kanchan)',
                nameEn: 'Gram Panchayat Uruli Kanchan',
                wards: ['Ward 1 (स्टेशन रोड)', 'Ward 2 (आश्रम रोड)', 'Ward 3 (गावठाण)', 'Ward 4 (कांचन नगर)']
              },
              {
                id: 'loni_kalbhor',
                nameMr: 'ग्रामपंचायत लोणी काळभोर (Loni Kalbhor)',
                nameEn: 'Gram Panchayat Loni Kalbhor',
                wards: ['Ward 1 (रेल्वे गेट)', 'Ward 2 (महाविद्यालय परिसर)', 'Ward 3 (गावठाण)', 'Ward 4 (माळी वस्ती)']
              }
            ]
          },
          {
            id: 'mulshi',
            nameMr: 'मुळशी (Mulshi)',
            nameEn: 'Mulshi',
            panchayats: [
              {
                id: 'pirangut',
                nameMr: 'ग्रामपंचायत पिरंगुट (Pirangut)',
                nameEn: 'Gram Panchayat Pirangut',
                wards: ['Ward 1 (एमआयडीसी चौक)', 'Ward 2 (बाजारपेठ)', 'Ward 3 (गावठाण)', 'Ward 4 (लव्हाळे फाटा)']
              },
              {
                id: 'paud',
                nameMr: 'ग्रामपंचायत पौड (Paud)',
                nameEn: 'Gram Panchayat Paud',
                wards: ['Ward 1 (तहसील चौक)', 'Ward 2 (गावठाण)', 'Ward 3 (बस स्टँड परिसर)']
              },
              {
                id: 'hinjawadi',
                nameMr: 'ग्रामपंचायत हिंजवडी (Hinjawadi)',
                nameEn: 'Gram Panchayat Hinjawadi',
                wards: ['Ward 1 (फेज १ इन्फोटेक)', 'Ward 2 (गावठाण)', 'Ward 3 (लक्ष्मी चौक)', 'Ward 4 (जांभूळकर वस्ती)']
              },
              {
                id: 'marunji',
                nameMr: 'ग्रामपंचायत मारुंजी (Marunji)',
                nameEn: 'Gram Panchayat Marunji',
                wards: ['Ward 1 (गावठाण)', 'Ward 2 (कन्हे रोड)', 'Ward 3 (आयटी पार्क रोड)']
              }
            ]
          },
          {
            id: 'baramati',
            nameMr: 'बारामती (Baramati)',
            nameEn: 'Baramati',
            panchayats: [
              {
                id: 'malegaon_bk',
                nameMr: 'ग्रामपंचायत माळेगाव बु. (Malegaon Bk)',
                nameEn: 'Gram Panchayat Malegaon Bk',
                wards: ['Ward 1 (कारखाना परिसर)', 'Ward 2 (गावठाण)', 'Ward 3 (शिवाजी चौक)', 'Ward 4 (शारदानगर)']
              },
              {
                id: 'katewadi',
                nameMr: 'ग्रामपंचायत काटेवाडी (Katewadi)',
                nameEn: 'Gram Panchayat Katewadi',
                wards: ['Ward 1 (गावठाण)', 'Ward 2 (कन्हेर रोड)', 'Ward 3 (बाजारपेठ)']
              },
              {
                id: 'supe',
                nameMr: 'ग्रामपंचायत सुपे (Supe)',
                nameEn: 'Gram Panchayat Supe',
                wards: ['Ward 1 (बाजार मैदान)', 'Ward 2 (गावठाण)', 'Ward 3 (मोरगाव फाटा)']
              }
            ]
          },
          {
            id: 'maval',
            nameMr: 'मावळ (Maval)',
            nameEn: 'Maval',
            panchayats: [
              {
                id: 'talegaon_rural',
                nameMr: 'ग्रामपंचायत तळेगाव ग्रामीण (Talegaon Rural)',
                nameEn: 'Gram Panchayat Talegaon Rural',
                wards: ['Ward 1 (स्टेशन परिसर)', 'Ward 2 (गावठाण)', 'Ward 3 (एमआयडीसी परिसर)']
              },
              {
                id: 'kamshet',
                nameMr: 'ग्रामपंचायत कामशेत (Kamshet)',
                nameEn: 'Gram Panchayat Kamshet',
                wards: ['Ward 1 (हायवे चौक)', 'Ward 2 (गावठाण)', 'Ward 3 (नदीकाठ)']
              },
              {
                id: 'karla',
                nameMr: 'ग्रामपंचायत कार्ला (Karla)',
                nameEn: 'Gram Panchayat Karla',
                wards: ['Ward 1 (लेणी पायथा)', 'Ward 2 (गावठाण)', 'Ward 3 (एकविरा मंदिर परिसर)']
              }
            ]
          },
          {
            id: 'shirur',
            nameMr: 'शिरूर (Shirur)',
            nameEn: 'Shirur',
            panchayats: [
              {
                id: 'shikrapur',
                nameMr: 'ग्रामपंचायत शिक्रापूर (Shikrapur)',
                nameEn: 'Gram Panchayat Shikrapur',
                wards: ['Ward 1 (चाकण चौक)', 'Ward 2 (बाजारपेठ)', 'Ward 3 (गावठाण)', 'Ward 4 (तळेगाव ढमढेरे रोड)']
              },
              {
                id: 'ranjangaon',
                nameMr: 'ग्रामपंचायत रांजणगाव गणपती (Ranjangaon)',
                nameEn: 'Gram Panchayat Ranjangaon',
                wards: ['Ward 1 (महागणपती मंदिर परिसर)', 'Ward 2 (गावठाण)', 'Ward 3 (एमआयडीसी वसाहत)']
              },
              {
                id: 'sanaswadi',
                nameMr: 'ग्रामपंचायत सणसवाडी (Sanaswadi)',
                nameEn: 'Gram Panchayat Sanaswadi',
                wards: ['Ward 1 (हायवे परिसर)', 'Ward 2 (गावठाण)', 'Ward 3 (कंपनी परिसर)']
              }
            ]
          }
        ]
      },
      {
        id: 'satara',
        nameMr: 'सातारा (Satara)',
        nameEn: 'Satara',
        talukas: [
          {
            id: 'karad',
            nameMr: 'कराड (Karad)',
            nameEn: 'Karad',
            panchayats: [
              {
                id: 'malkapur',
                nameMr: 'ग्रामपंचायत मलकापूर (Malkapur)',
                nameEn: 'Gram Panchayat Malkapur',
                wards: ['Ward 1 (हायवे परिसर)', 'Ward 2 (गावठाण)', 'Ward 3 (कृष्णा नाका)']
              },
              {
                id: 'vidyanagar',
                nameMr: 'ग्रामपंचायत विद्यानगर (Vidyanagar)',
                nameEn: 'Gram Panchayat Vidyanagar',
                wards: ['Ward 1 (कॉलेज परिसर)', 'Ward 2 (गावठाण)', 'Ward 3 (सैदापूर फाटा)']
              }
            ]
          },
          {
            id: 'wai',
            nameMr: 'वाई (Wai)',
            nameEn: 'Wai',
            panchayats: [
              {
                id: 'menavali',
                nameMr: 'ग्रामपंचायत मेणवली (Menavali)',
                nameEn: 'Gram Panchayat Menavali',
                wards: ['Ward 1 (नाना फडणवीस वाडा)', 'Ward 2 (गावठाण)', 'Ward 3 (कृष्णा घाट)']
              },
              {
                id: 'pasarni',
                nameMr: 'ग्रामपंचायत पसरणी (Pasarni)',
                nameEn: 'Gram Panchayat Pasarni',
                wards: ['Ward 1 (घाट पायथा)', 'Ward 2 (गावठाण)', 'Ward 3 (बाजारपेठ)']
              }
            ]
          }
        ]
      },
      {
        id: 'ahilyanagar',
        nameMr: 'अहिल्यानगर / अहमदनगर (Ahilyanagar)',
        nameEn: 'Ahilyanagar',
        talukas: [
          {
            id: 'rahata',
            nameMr: 'राहाता (Rahata)',
            nameEn: 'Rahata',
            panchayats: [
              {
                id: 'shirdi_rural',
                nameMr: 'ग्रामपंचायत शिर्डी ग्रामीण (Shirdi Rural)',
                nameEn: 'Gram Panchayat Shirdi Rural',
                wards: ['Ward 1 (मंदिर परिसर)', 'Ward 2 (गावठाण)', 'Ward 3 (नांदेड रोड)']
              },
              {
                id: 'sakuri',
                nameMr: 'ग्रामपंचायत साकुरी (Sakuri)',
                nameEn: 'Gram Panchayat Sakuri',
                wards: ['Ward 1 (उपासनी आश्रम परिसर)', 'Ward 2 (गावठाण)', 'Ward 3 (बाजार मैदान)']
              }
            ]
          },
          {
            id: 'sangamner',
            nameMr: 'संगमनेर (Sangamner)',
            nameEn: 'Sangamner',
            panchayats: [
              {
                id: 'ghulewadi',
                nameMr: 'ग्रामपंचायत घुलेवाडी (Ghulewadi)',
                nameEn: 'Gram Panchayat Ghulewadi',
                wards: ['Ward 1 (हायवे नाका)', 'Ward 2 (गावठाण)', 'Ward 3 (अमृतनगर)']
              }
            ]
          }
        ]
      },
      {
        id: 'nashik',
        nameMr: 'नाशिक (Nashik)',
        nameEn: 'Nashik',
        talukas: [
          {
            id: 'niphad',
            nameMr: 'निफाड (Niphad)',
            nameEn: 'Niphad',
            panchayats: [
              {
                id: 'pimpalgaon_baswant',
                nameMr: 'ग्रामपंचायत पिंपळगाव बसवंत (Pimpalgaon Baswant)',
                nameEn: 'Gram Panchayat Pimpalgaon Baswant',
                wards: ['Ward 1 (टोमॅटो मार्केट)', 'Ward 2 (गावठाण)', 'Ward 3 (स्टेशन रोड)', 'Ward 4 (हायवे चौक)']
              },
              {
                id: 'ozar',
                nameMr: 'ग्रामपंचायत ओझर (Ozar)',
                nameEn: 'Gram Panchayat Ozar',
                wards: ['Ward 1 (एचएएल टाउनशिप परिसर)', 'Ward 2 (विमानतळ रोड)', 'Ward 3 (गावठाण)']
              }
            ]
          },
          {
            id: 'sinnar',
            nameMr: 'सिन्नर (Sinnar)',
            nameEn: 'Sinnar',
            panchayats: [
              {
                id: 'musalgaon',
                nameMr: 'ग्रामपंचायत मुसळगाव (Musalgaon)',
                nameEn: 'Gram Panchayat Musalgaon',
                wards: ['Ward 1 (एमआयडीसी)', 'Ward 2 (गावठाण)', 'Ward 3 (पांढुर्ली रोड)']
              }
            ]
          }
        ]
      },
      {
        id: 'kolhapur',
        nameMr: 'कोल्हापूर (Kolhapur)',
        nameEn: 'Kolhapur',
        talukas: [
          {
            id: 'karveer',
            nameMr: 'करवीर (Karveer)',
            nameEn: 'Karveer',
            panchayats: [
              {
                id: 'uchgaon',
                nameMr: 'ग्रामपंचायत उचगाव (Uchgaon)',
                nameEn: 'Gram Panchayat Uchgaon',
                wards: ['Ward 1 (रेल्वे लाईन परिसर)', 'Ward 2 (गावठाण)', 'Ward 3 (मणेरमळा)', 'Ward 4 (कदमवाडी रोड)']
              },
              {
                id: 'shiroli_pulachi',
                nameMr: 'ग्रामपंचायत शिरोली पुलाची (Shiroli Pulachi)',
                nameEn: 'Gram Panchayat Shiroli Pulachi',
                wards: ['Ward 1 (हायवे चौक)', 'Ward 2 (गावठाण)', 'Ward 3 (एमआयडीसी)']
              }
            ]
          },
          {
            id: 'hatkanangle',
            nameMr: 'हातकणंगले (Hatkanangle)',
            nameEn: 'Hatkanangle',
            panchayats: [
              {
                id: 'hupari',
                nameMr: 'ग्रामपंचायत हुपरी (Hupari - Silver City)',
                nameEn: 'Gram Panchayat Hupari',
                wards: ['Ward 1 (चांदी बाजार)', 'Ward 2 (गावठाण)', 'Ward 3 (महादेव गल्ली)', 'Ward 4 (यड्राव रोड)']
              }
            ]
          }
        ]
      },
      {
        id: 'chhatrapati_sambhajinagar',
        nameMr: 'छत्रपती संभाजीनगर (Chhatrapati Sambhajinagar)',
        nameEn: 'Chhatrapati Sambhajinagar',
        talukas: [
          {
            id: 'gangapur',
            nameMr: 'गंगापूर (Gangapur)',
            nameEn: 'Gangapur',
            panchayats: [
              {
                id: 'waluj',
                nameMr: 'ग्रामपंचायत वाळूज (Waluj)',
                nameEn: 'Gram Panchayat Waluj',
                wards: ['Ward 1 (एमआयडीसी परिसर)', 'Ward 2 (गावठाण)', 'Ward 3 (पंढरपूर फाटा)']
              }
            ]
          }
        ]
      }
    ]
  }
];
