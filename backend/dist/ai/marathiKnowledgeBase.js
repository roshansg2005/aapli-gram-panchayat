"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GP_GENERAL_INFO = exports.SCHEMES_KNOWLEDGE = exports.CERTIFICATE_REQUIREMENTS = void 0;
exports.CERTIFICATE_REQUIREMENTS = [
    {
        type: 'income',
        keywords: ['उत्पन्न', 'वार्षिक उत्पन्न', 'income', 'tahasildar', 'kamai', 'tahsildar'],
        titleMr: 'वार्षिक उत्पन्न दाखला (Income Certificate)',
        descriptionMr: 'शिक्षणासाठी व शासकीय योजनांसाठी उत्पन्नाचा दाखला दिला जातो.',
        requiredDocumentsMr: [
            'रेशन कार्ड (Ration Card) झेरॉक्स',
            'तलाठी उत्पन्नाचा अहवाल / फॉर्म नं १६',
            'आधार कार्ड (Aadhaar Card)',
            'स्वयंघोषणापत्र (Self Declaration)'
        ],
        deliveryDays: 2,
        fee: 20
    },
    {
        type: 'residence',
        keywords: ['रहिवासी', 'रहवासी', 'residence', 'stay', 'domicile', 'address'],
        titleMr: 'रहिवासी दाखला (Residence Certificate)',
        descriptionMr: 'गावात कायमस्वरूपी वास्तव्याचा पुरावा म्हणून हा दाखला दिला जातो.',
        requiredDocumentsMr: [
            'आधार कार्ड (Aadhaar Card)',
            'लाईट बिल किंवा चालू वर्षाची घरपट्टी कर पावती',
            'मतदान ओळखपत्र (Voter ID)'
        ],
        deliveryDays: 1,
        fee: 20
    },
    {
        type: 'birth',
        keywords: ['जन्म', 'बाळ', 'birth', 'janma', 'balak'],
        titleMr: 'जन्म नोंद दाखला (Birth Certificate)',
        descriptionMr: 'ग्रामपंचायत हद्दीत झालेल्या बालकांच्या जन्माची अधिकृत नोंद.',
        requiredDocumentsMr: [
            'हॉस्पिटल डिस्चार्ज कार्ड / जन्म अहवाल',
            'आई व वडिलांचे आधार कार्ड',
            'रेशन कार्ड'
        ],
        deliveryDays: 1,
        fee: 0
    },
    {
        type: 'death',
        keywords: ['मृत्यू', 'मयत', 'death', 'mrutyu', 'pass away'],
        titleMr: 'मृत्यू नोंद दाखला (Death Certificate)',
        descriptionMr: 'मृत्यूची अधिकृत शासकीय नोंद व वारसांसाठी आवश्यक दाखला.',
        requiredDocumentsMr: [
            'डॉक्टरांचे अधिकृत मृत्यू प्रमाणपत्र (Medical Certificate)',
            'मृत व्यक्तीचे व अर्जदाराचे आधार कार्ड',
            'स्मशानभूमी पावती / गावकामगार अहवाल'
        ],
        deliveryDays: 1,
        fee: 0
    },
    {
        type: 'bpl',
        keywords: ['दारिद्र्य', 'बीपीएल', 'bpl', 'garib', 'ration'],
        titleMr: 'दारिद्र्यरेषेखालील दाखला (BPL Certificate)',
        descriptionMr: 'दारिद्र्यरेषेखालील (BPL) कुटुंबांसाठी योजना लाभाचा दाखला.',
        requiredDocumentsMr: [
            'बीपीएल सर्वेक्षण यादीतील अनुक्रमांक',
            'पिवळे रेशन कार्ड झेरॉक्स',
            'आधार कार्ड व कुटुंब प्रमुखाचा फोटो'
        ],
        deliveryDays: 2,
        fee: 10
    },
    {
        type: 'noc',
        keywords: ['ना हरकत', 'एनओसी', 'बांधकाम', 'noc', 'construction', 'building', 'light connection'],
        titleMr: 'ना हरकत प्रमाणपत्र / बांधकाम परवानगी (NOC Certificate)',
        descriptionMr: 'घर बांधकाम, वीज जोडणी किंवा व्यवसाय सुरू करण्यासाठी एनओसी.',
        requiredDocumentsMr: [
            'जागेचा चालू ७/१२ किंवा नमुना ८ अ उतारा',
            'ग्रामपंचायत सर्व कर भरलेली चालू पावती',
            'जागेचा नकाशा व आर्किटेक्ट प्लॅन (बांधकामासाठी)'
        ],
        deliveryDays: 3,
        fee: 50
    },
    {
        type: 'marriage',
        keywords: ['विवाह', 'लग्न', 'marriage', 'wedding', 'patni'],
        titleMr: 'विवाह नोंदणी दाखला (Marriage Certificate)',
        descriptionMr: 'विवाह झाल्याची अधिकृत ग्रामपंचायत नोंदणी.',
        requiredDocumentsMr: [
            'लग्नपत्रिका (Wedding Card) मूळ प्रत',
            'वर व वधूचे आधार कार्ड व वयाचा पुरावा (शाळा सोडल्याचा दाखला)',
            '३ सज्ञान साक्षीदारांचे आधार कार्ड',
            'विवाह सोहळ्याचे २ फोटो'
        ],
        deliveryDays: 2,
        fee: 50
    },
    {
        type: 'toilet',
        keywords: ['शौचालय', 'टॉयलेट', 'toilet', 'swachh'],
        titleMr: 'शौचालय दाखला (Toilet Certificate)',
        descriptionMr: 'निवडणूक व शासकीय लाभासाठी घरात शौचालय असल्याचा दाखला.',
        requiredDocumentsMr: [
            'जागेचा नमुना ८ अ उतारा',
            'चालू वर्षाची घरपट्टी पावती',
            'कुटुंबासह शौचालयाचा प्रत्यक्ष फोटो'
        ],
        deliveryDays: 1,
        fee: 20
    }
];
exports.SCHEMES_KNOWLEDGE = [
    {
        id: 'ladki-bahin',
        keywords: ['लाडकी बहीण', 'महिला', 'ladki bahin', 'mahila', '1500'],
        nameMr: 'मुख्यमंत्री माझी लाडकी बहीण योजना',
        benefitMr: 'पात्र महिलांना दरमहा १५०० रुपये थेट बँक खात्यात.',
        eligibilityMr: 'वय २१ ते ६५ वर्षे, कुटुंबाचे वार्षिक उत्पन्न २.५ लाखांपेक्षा कमी असावे.',
        documentsMr: ['आधार कार्ड', 'बँक पासबुक', 'अधिवास दाखला किंवा रेशन कार्ड', 'उत्पन्न हमीपत्र']
    },
    {
        id: 'pm-kisan',
        keywords: ['पीएम किसान', 'नमो शेतकरी', 'kisan', 'farmer', 'shetkari', '6000'],
        nameMr: 'पीएम किसान व नमो शेतकरी महासन्मान योजना',
        benefitMr: 'पात्र शेतकरी कुटुंबाला वर्षाला १२,००० रुपये (केंद्र ६००० + राज्य ६०००).',
        eligibilityMr: 'स्वतःच्या नावावर शेतजमीन असणारे सर्व अल्प व अत्यल्प भूधारक शेतकरी.',
        documentsMr: ['चालू ७/१२ व ८ अ उतारा', 'आधार कार्ड (e-KYC पूर्ण)', 'बँक खाते आधार लिंक']
    },
    {
        id: 'gharkul',
        keywords: ['घरकुल', 'रमाई', 'आवास', 'gharkul', 'pm awas', 'makaan'],
        nameMr: 'प्रधानमंत्री व रमाई आवास घरकुल योजना',
        benefitMr: 'पक्के घर बांधकामासाठी १.२० लाख ते २.५० लाख रुपयांपर्यंत शासकीय अनुदान.',
        eligibilityMr: 'बेघर किंवा कच्चे घर असणारे, ग्रामसभेच्या आवास प्रतीक्षा यादीतील कुटुंब.',
        documentsMr: ['जागेचा मालकी पुरावा किंवा नमुना ८', 'उत्पन्न दाखला', 'आधार व रेशन कार्ड', 'जॉब कार्ड']
    }
];
exports.GP_GENERAL_INFO = {
    defaultGpNameMr: 'घुलेवाडी ग्रामपंचायत (ता. संगमनेर, जि. अहिल्यानगर)',
    officeTimingsMr: 'सोमवार ते शनिवार सकाळी १०:०० ते सायंकाळी ५:३० (रविवार व शासकीय सुट्टी बंद). ग्रामसेवक भेट वेळ: सकाळी १०:३० ते दुपारी १:०० वाजेपर्यंत.',
    waterTimingsMr: 'गावात पिण्याचे पाणी दररोज सकाळी ६:०० ते ८:०० आणि सायंकाळी ६:०० ते ७:३० या वेळेत सोडले जाते. पाईपलाईन तक्रारीसाठी ग्रामपंचायतीत संपर्क करा.',
    taxRebateRuleMr: 'चालू वर्षाची घरपट्टी व पाणीपट्टी ३१ मार्चपूर्वी भरल्यास एकूण करावर १०% सवलत मिळते. वेळेवर कर भरून गावाच्या विकासात सहकार्य करा.',
    gramSevakWorker: {
        nameMr: 'श्री. आर. के. पाटील (ग्रामसेवक)',
        phone: '9822034161',
        designationMr: 'ग्रामविकास अधिकारी / ग्रामसेवक'
    },
    sarpanchWorker: {
        nameMr: 'सौ. अनिताताई घुले (सरपंच)',
        phone: '9822011223',
        designationMr: 'सरपंच'
    }
};
