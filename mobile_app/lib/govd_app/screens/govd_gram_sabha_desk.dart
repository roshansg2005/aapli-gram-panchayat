import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../widgets/govd_theme.dart';

class GovdGramSabhaDesk extends StatefulWidget {
  const GovdGramSabhaDesk({super.key});

  @override
  State<GovdGramSabhaDesk> createState() => _GovdGramSabhaDeskState();
}

class _GovdGramSabhaDeskState extends State<GovdGramSabhaDesk> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final Map<String, dynamic> _featuredUpcoming = {
    'id': 'GS-2026-01',
    'title': 'प्रजासत्ताक दिन विशेष ग्रामसभा',
    'titleEn': 'Republic Day Special Gram Sabha',
    'date': '26 January 2026',
    'dateMr': '२६ जानेवारी २०२६',
    'time': '9:30 AM',
    'timeMr': 'सकाळी ०९:३० वाजता',
    'venue': 'Gram Panchayat Hall, Ghulewadi',
    'venueMr': 'ग्रामपंचायत मध्यवर्ती सभागृह, घुलेवाडी',
    'status': 'scheduled',
    'quorum': 'किमान १०० ग्रामस्थ उपस्थिती आवश्यक',
    'convenor': 'श्री. सुरेश पाटील (ग्रामसेवक) व श्री. राहुल कदम (सरपंच)',
    'agenda': [
      '१. मागील ग्रामसभा इतिवृत्त व ठराव वाचन आणि मंजुरी.',
      '२. वार्षिक विकास आराखडा व अंदाजपत्रक २०२६-२७ सादरीकरण.',
      '३. जल जीवन मिशन पाणीपुरवठा योजना विस्तार व नळ जोडणी आढावा.',
      '४. रमाई व PM आवास योजना नवीन लाभार्थी यादी वाचन.',
      '५. अध्यक्षांच्या परवानगीने ऐनवेळचे विषय.',
    ],
    'attendance': [
      {'name': 'रमेश बाबुराव घुले', 'ward': 'वॉर्ड १', 'time': '०९:१५ AM', 'status': 'हजर'},
      {'name': 'बाळासाहेब विठ्ठल तांबे', 'ward': 'वॉर्ड २', 'time': '०९:२० AM', 'status': 'हजर'},
      {'name': 'सुनिता दत्तात्रय कदम', 'ward': 'वॉर्ड १', 'time': '०९:२२ AM', 'status': 'हजर'},
      {'name': 'गणेश ज्ञानेश्वर थोरात', 'ward': 'वॉर्ड ३', 'time': '०९:२५ AM', 'status': 'हजर'},
    ],
    'discussions': [
      {'topic': 'पाणीपुरवठा नियमितीकरण', 'speaker': 'दत्तात्रय जोशी (ग्रामस्थ)', 'notes': 'आठवड्यातून ३ दिवस पाणीपुरवठा दाबाने देण्याची मागणी.'},
      {'topic': 'स्मशानभूमी शेड दुरुस्ती', 'speaker': 'सरपंच राहुल कदम', 'notes': '१५ व्या वित्त आयोगातून तातडीने निधी मंजूर करण्यात येईल.'},
    ],
    'resolutions': [
      {'no': 'ठराव क्र. ०१/२०२६', 'subject': 'नवीन सौर पथदिवे बसविणे', 'proposer': 'राहुल कदम (सरपंच)', 'seconder': 'सुरेश पाटील (ग्रामसेवक)', 'status': 'सर्वानुमते मंजूर'},
      {'no': 'ठराव क्र. ०२/२०२६', 'subject': 'स्वच्छ भारत अभियान घनकचरा व्यवस्थापन', 'proposer': 'संजय घुले', 'seconder': 'सुनिता तांबे', 'status': 'सर्वानुमते मंजूर'},
    ],
    'attachments': [
      {'name': 'ग्रामसभा पूर्वसूचना नोटीस (PDF)', 'size': '१.२ MB', 'date': '१० जाने २०२६'},
      {'name': 'विकास आराखडा मसुदा (PDF)', 'size': '३.४ MB', 'date': '१५ जाने २०२६'},
    ],
  };

  final List<Map<String, dynamic>> _pastMeetings = [
    {
      'id': 'GS-2025-04',
      'title': 'गांधी जयंती विशेष ग्रामसभा',
      'date': '०२ ऑक्टोबर २०२५',
      'attendance': '१४२ नागरिक उपस्थित',
      'resolutions': '८ ठराव एकमुखाने मंजूर',
      'keyDecision': 'स्वच्छ गाव सुंदर गाव अंतर्गत १००% घनकचरा व्यवस्थापन व सौर पथदिवे प्रकल्प मंजुरी.',
    },
    {
      'id': 'GS-2025-03',
      'title': 'स्वातंत्र्य दिन वार्षिक ग्रामसभा',
      'date': '१५ ऑगस्ट २०२५',
      'attendance': '१६८ नागरिक उपस्थित',
      'resolutions': '१२ ठराव मंजूर',
      'keyDecision': 'आरोग्य उपकेंद्र नवीन इमारत बांधकाम व स्मशानभूमी रस्ता कॉंक्रिटीकरण.',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : GovdTheme.bgSurface,
      appBar: AppBar(
        backgroundColor: GovdTheme.navyDark,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '🏛️ ग्रामसभा व ठराव व्यवस्थापन',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            Text(
              'Gram Sabha Digital Record Keeping Desk',
              style: TextStyle(fontSize: 10.5, color: Colors.white.withOpacity(0.7)),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: GovdTheme.saffronPrimary,
          indicatorWeight: 3,
          labelColor: GovdTheme.saffronPrimary,
          unselectedLabelColor: Colors.white70,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(text: '📅 आगामी ग्रामसभा'),
            Tab(text: '📜 मागील ठराव नोंदवही'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Section 10 Specification
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // UPCOMING GRAM SABHA HIGHLIGHT CARD
                _buildUpcomingHighlightCard(isDark),

                const SizedBox(height: 20),

                // 4 QUICK ACTIONS
                Text(
                  'त्वरित कृती (Actions)',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white70 : const Color(0xFF334155),
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 10),
                _buildActionButtonsRow(context, isDark),

                const SizedBox(height: 20),

                // AGENDA PREVIEW
                _buildAgendaSummaryCard(isDark),

                const SizedBox(height: 16),

                // ATTENDANCE & RESOLUTIONS QUICK METRIC
                _buildMeetingStatsRow(isDark),

                const SizedBox(height: 30),
              ],
            ),
          ),

          // Tab 2: Past Meetings & Resolutions
          ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: _pastMeetings.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (ctx, i) {
              final m = _pastMeetings[i];
              return _buildPastMeetingCard(m, isDark);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildUpcomingHighlightCard(bool isDark) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: GovdTheme.saffronPrimary.withOpacity(0.4), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: GovdTheme.saffronPrimary.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Header Ribbon
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: GovdTheme.saffronPrimary.withOpacity(0.12),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Flexible(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: GovdTheme.saffronPrimary,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Upcoming Gram Sabha',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            color: GovdTheme.saffronDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: GovdTheme.emeraldLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    '🟢 नियोजित',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: GovdTheme.emeraldDark),
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _featuredUpcoming['title'],
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 12),

                // Date & Time Box
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: GovdTheme.navyDark.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.calendar_month_rounded, size: 20, color: GovdTheme.navyDark),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Date', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                                  FittedBox(
                                    fit: BoxFit.scaleDown,
                                    alignment: Alignment.centerLeft,
                                    child: Text(
                                      _featuredUpcoming['date'],
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(width: 1, height: 32, color: const Color(0xFFCBD5E1)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: GovdTheme.saffronPrimary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.access_time_rounded, size: 20, color: GovdTheme.saffronPrimary),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Time', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                                  FittedBox(
                                    fit: BoxFit.scaleDown,
                                    alignment: Alignment.centerLeft,
                                    child: Text(
                                      _featuredUpcoming['time'],
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Venue Row
                Row(
                  children: [
                    const Icon(Icons.location_on_rounded, size: 16, color: GovdTheme.saffronPrimary),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        _featuredUpcoming['venue'],
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // [View Details] Button (Section 10 requirement)
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton.icon(
                    onPressed: () => _openMeetingDetailsSheet(context, isDark),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: GovdTheme.navyDark,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.visibility_outlined, size: 18),
                    label: const Text(
                      'View Details (सविस्तर माहिती पहा)',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtonsRow(BuildContext context, bool isDark) {
    final actions = [
      {'label': '+ Create Meeting', 'icon': Icons.add_circle_outline_rounded, 'color': GovdTheme.navyDark, 'action': () => _showCreateMeetingDialog(context)},
      {'label': '+ Add Agenda', 'icon': Icons.post_add_rounded, 'color': GovdTheme.saffronDark, 'action': () => _showAddAgendaDialog(context)},
      {'label': '+ Record Attendance', 'icon': Icons.how_to_reg_rounded, 'color': GovdTheme.emeraldDark, 'action': () => _showRecordAttendanceDialog(context)},
      {'label': '+ Add Resolution', 'icon': Icons.gavel_rounded, 'color': const Color(0xFF4F46E5), 'action': () => _showAddResolutionDialog(context)},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 2.0,
      ),
      itemCount: actions.length,
      itemBuilder: (ctx, i) {
        final a = actions[i];
        final color = a['color'] as Color;

        return InkWell(
          onTap: a['action'] as VoidCallback,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: color.withOpacity(0.3), width: 1.2),
              boxShadow: [
                BoxShadow(color: color.withOpacity(0.04), blurRadius: 6, offset: const Offset(0, 2)),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(a['icon'] as IconData, size: 16, color: color),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    a['label'] as String,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : color,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildAgendaSummaryCard(bool isDark) {
    final agendaList = _featuredUpcoming['agenda'] as List<String>;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Text(
                  '📋 सभेचा अधिकृत अजेंडा (Agenda)',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
                ),
              ),
              const SizedBox(width: 6),
              Text(
                '${agendaList.length} विषय',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: GovdTheme.saffronDark),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...agendaList.take(3).map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('• ', style: TextStyle(fontWeight: FontWeight.bold, color: GovdTheme.saffronPrimary)),
                    Expanded(
                      child: Text(
                        item,
                        style: TextStyle(
                          fontSize: 11.5,
                          color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF334155),
                          height: 1.3,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
          if (agendaList.length > 3)
            GestureDetector(
              onTap: () => _openMeetingDetailsSheet(context, isDark),
              child: const Padding(
                padding: EdgeInsets.only(top: 4),
                child: Text(
                  '+ आणखी विषय पहा...',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: GovdTheme.primaryBlue),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMeetingStatsRow(bool isDark) {
    final attendance = _featuredUpcoming['attendance'] as List;
    final resolutions = _featuredUpcoming['resolutions'] as List;

    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.how_to_reg_rounded, size: 14, color: GovdTheme.emeraldDark),
                    SizedBox(width: 4),
                    Expanded(
                      child: Text('नोंदवलेली हजेरी', style: TextStyle(fontSize: 10, color: Color(0xFF64748B)), maxLines: 1),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text('${attendance.length} नागरिक', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.gavel_rounded, size: 14, color: Color(0xFF4F46E5)),
                    SizedBox(width: 4),
                    Expanded(
                      child: Text('मंजूर ठराव', style: TextStyle(fontSize: 10, color: Color(0xFF64748B)), maxLines: 1),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text('${resolutions.length} ठराव', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPastMeetingCard(Map<String, dynamic> m, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  m['title'],
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: isDark ? Colors.white : const Color(0xFF0F172A)),
                ),
              ),
              const SizedBox(width: 8),
              Text(m['date'], style: const TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8))),
            ],
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            runSpacing: 4,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: GovdTheme.emeraldLight, borderRadius: BorderRadius.circular(6)),
                child: Text(m['attendance'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: GovdTheme.emeraldDark)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: const Color(0xFFEEF2FF), borderRadius: BorderRadius.circular(6)),
                child: Text(m['resolutions'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF3730A3))),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'महत्त्वपूर्ण ठराव निर्णय: ${m["keyDecision"]}',
            style: TextStyle(fontSize: 11.5, color: isDark ? const Color(0xFFCBD5E1) : const Color(0xFF475569), height: 1.3),
          ),
        ],
      ),
    );
  }

  // COMPLETE MEETING DETAILS BOTTOM SHEET (Section 10 Requirement)
  void _openMeetingDetailsSheet(BuildContext context, bool isDark) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.9,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (_, scrollController) => Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: DefaultTabController(
            length: 5,
            child: Column(
              children: [
                // Drag handle
                Center(
                  child: Container(
                    margin: const EdgeInsets.only(top: 12, bottom: 8),
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(color: const Color(0xFFCBD5E1), borderRadius: BorderRadius.circular(2)),
                  ),
                ),

                // Sheet Title
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _featuredUpcoming['title'],
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                            ),
                            Text(
                              '${_featuredUpcoming["date"]} • ${_featuredUpcoming["time"]}',
                              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                ),

                // Tabs: Agenda, Attendance, Discussion, Resolution, Attachments
                TabBar(
                  isScrollable: true,
                  indicatorColor: GovdTheme.navyDark,
                  labelColor: isDark ? GovdTheme.saffronPrimary : GovdTheme.navyDark,
                  unselectedLabelColor: const Color(0xFF94A3B8),
                  labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  tabs: const [
                    Tab(text: '१. Agenda'),
                    Tab(text: '२. Attendance'),
                    Tab(text: '३. Discussion'),
                    Tab(text: '४. Resolution'),
                    Tab(text: '५. Attachments'),
                  ],
                ),

                Expanded(
                  child: TabBarView(
                    children: [
                      // 1. Agenda
                      ListView(
                        controller: scrollController,
                        padding: const EdgeInsets.all(16),
                        children: [
                          const Text('अधिकृत विषय सूची (Agenda List)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                          const SizedBox(height: 10),
                          ...(_featuredUpcoming['agenda'] as List<String>).map((a) => Card(
                                margin: const EdgeInsets.only(bottom: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                child: Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Text(a, style: const TextStyle(fontSize: 12, height: 1.3)),
                                ),
                              )),
                        ],
                      ),

                      // 2. Attendance
                      ListView(
                        controller: scrollController,
                        padding: const EdgeInsets.all(16),
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('नागरिक उपस्थिती नोंदवही', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                              ElevatedButton.icon(
                                onPressed: () => _showRecordAttendanceDialog(context),
                                style: ElevatedButton.styleFrom(backgroundColor: GovdTheme.emeraldDark, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4)),
                                icon: const Icon(Icons.add, size: 14),
                                label: const Text('हजेरी घ्या', style: TextStyle(fontSize: 11)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          ...(_featuredUpcoming['attendance'] as List).map((att) => ListTile(
                                dense: true,
                                leading: const CircleAvatar(radius: 14, backgroundColor: GovdTheme.navyDark, child: Icon(Icons.person, size: 16, color: Colors.white)),
                                title: Text(att['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                subtitle: Text('${att["ward"]} • ${att["time"]}', style: const TextStyle(fontSize: 10)),
                                trailing: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(color: GovdTheme.emeraldLight, borderRadius: BorderRadius.circular(6)),
                                  child: Text(att['status'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: GovdTheme.emeraldDark)),
                                ),
                              )),
                        ],
                      ),

                      // 3. Discussion
                      ListView(
                        controller: scrollController,
                        padding: const EdgeInsets.all(16),
                        children: [
                          const Text('ग्रामसभा चर्चा व नोंदवही', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                          const SizedBox(height: 10),
                          ...(_featuredUpcoming['discussions'] as List).map((d) => Card(
                                margin: const EdgeInsets.only(bottom: 10),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                child: Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(d['topic'], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: GovdTheme.navyDark)),
                                      const SizedBox(height: 4),
                                      Text('वक्ता: ${d["speaker"]}', style: const TextStyle(fontSize: 10.5, fontStyle: FontStyle.italic, color: Color(0xFF64748B))),
                                      const SizedBox(height: 6),
                                      Text(d['notes'], style: const TextStyle(fontSize: 11.5, height: 1.3)),
                                    ],
                                  ),
                                ),
                              )),
                        ],
                      ),

                      // 4. Resolution
                      ListView(
                        controller: scrollController,
                        padding: const EdgeInsets.all(16),
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('मंजूर झालेले ठराव', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                              ElevatedButton.icon(
                                onPressed: () => _showAddResolutionDialog(context),
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F46E5), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4)),
                                icon: const Icon(Icons.add, size: 14),
                                label: const Text('ठराव जोडा', style: TextStyle(fontSize: 11)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          ...(_featuredUpcoming['resolutions'] as List).map((r) => Container(
                                margin: const EdgeInsets.only(bottom: 10),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(r['no'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: GovdTheme.saffronDark)),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(color: GovdTheme.emeraldLight, borderRadius: BorderRadius.circular(4)),
                                          child: Text(r['status'], style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: GovdTheme.emeraldDark)),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(r['subject'], style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 4),
                                    Text('सूचक: ${r["proposer"]} | अनुमोदक: ${r["seconder"]}', style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                                  ],
                                ),
                              )),
                        ],
                      ),

                      // 5. Attachments
                      ListView(
                        controller: scrollController,
                        padding: const EdgeInsets.all(16),
                        children: [
                          const Text('डिजिटल कागदपत्रे व संलग्न फाइल्स', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                          const SizedBox(height: 10),
                          ...(_featuredUpcoming['attachments'] as List).map((att) => ListTile(
                                leading: const Icon(Icons.picture_as_pdf_rounded, color: Colors.red),
                                title: Text(att['name'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                subtitle: Text('${att["size"]} • ${att["date"]}', style: const TextStyle(fontSize: 10)),
                                trailing: IconButton(
                                  icon: const Icon(Icons.download_rounded),
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('डाउनलोड सुरू झाले...')));
                                  },
                                ),
                              )),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // DIALOGS FOR 4 ACTIONS
  void _showCreateMeetingDialog(BuildContext context) {
    final titleController = TextEditingController();
    final dateController = TextEditingController();
    final venueController = TextEditingController(text: 'ग्रामपंचायत मध्यवर्ती सभागृह');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('नवीन ग्रामसभा आयोजित करा', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: titleController, decoration: const InputDecoration(labelText: 'सभेचे नाव/उद्देश', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: dateController, decoration: const InputDecoration(labelText: 'दिनांक व वेळ', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: venueController, decoration: const InputDecoration(labelText: 'बैठक स्थळ', border: OutlineInputBorder())),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करा')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: GovdTheme.navyDark, foregroundColor: Colors.white),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('नवीन ग्रामसभा बैठक नियोजित झाली!'), backgroundColor: GovdTheme.emeraldDark),
              );
            },
            child: const Text('आयोजित करा'),
          ),
        ],
      ),
    );
  }

  void _showAddAgendaDialog(BuildContext context) {
    final agendaController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('नवीन अजेंडा विषय जोडा', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: TextField(
          controller: agendaController,
          maxLines: 3,
          decoration: const InputDecoration(labelText: 'अजेंडा विषय तपशील', border: OutlineInputBorder()),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करा')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: GovdTheme.saffronPrimary, foregroundColor: Colors.white),
            onPressed: () {
              if (agendaController.text.trim().isNotEmpty) {
                setState(() {
                  (_featuredUpcoming['agenda'] as List<String>).add(agendaController.text.trim());
                });
              }
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('अजेंडा विषय समाविष्ट केला गेला!'), backgroundColor: GovdTheme.emeraldDark),
              );
            },
            child: const Text('जोडा'),
          ),
        ],
      ),
    );
  }

  void _showRecordAttendanceDialog(BuildContext context) {
    final nameController = TextEditingController();
    final wardController = TextEditingController(text: 'वॉर्ड क्र. १');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('नागरिक हजेरी नोंदवा', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameController, decoration: const InputDecoration(labelText: 'ग्रामस्थाचे संपूर्ण नाव', border: OutlineInputBorder())),
            const SizedBox(height: 8),
            TextField(controller: wardController, decoration: const InputDecoration(labelText: 'वॉर्ड / गल्ली', border: OutlineInputBorder())),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करा')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: GovdTheme.emeraldDark, foregroundColor: Colors.white),
            onPressed: () {
              if (nameController.text.trim().isNotEmpty) {
                setState(() {
                  (_featuredUpcoming['attendance'] as List).add({
                    'name': nameController.text.trim(),
                    'ward': wardController.text.trim(),
                    'time': '१०:०० AM',
                    'status': 'हजर',
                  });
                });
              }
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('उपस्थिती नोंदवली गेली!'), backgroundColor: GovdTheme.emeraldDark),
              );
            },
            child: const Text('नोंदवा'),
          ),
        ],
      ),
    );
  }

  void _showAddResolutionDialog(BuildContext context) {
    final subjController = TextEditingController();
    final propController = TextEditingController();
    final secController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Text('नवीन ठराव नोंदवा (Add Resolution)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: subjController, maxLines: 2, decoration: const InputDecoration(labelText: 'ठरावाचा विषय व निर्णय', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: propController, decoration: const InputDecoration(labelText: 'सूचक (Proposer)', border: OutlineInputBorder())),
              const SizedBox(height: 8),
              TextField(controller: secController, decoration: const InputDecoration(labelText: 'अनुमोदक (Seconder)', border: OutlineInputBorder())),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('रद्द करा')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F46E5), foregroundColor: Colors.white),
            onPressed: () {
              if (subjController.text.trim().isNotEmpty) {
                setState(() {
                  final nextNo = (_featuredUpcoming['resolutions'] as List).length + 1;
                  (_featuredUpcoming['resolutions'] as List).add({
                    'no': 'ठराव क्र. ०$nextNo/२०२६',
                    'subject': subjController.text.trim(),
                    'proposer': propController.text.trim().isNotEmpty ? propController.text.trim() : 'राहुल कदम (सरपंच)',
                    'seconder': secController.text.trim().isNotEmpty ? secController.text.trim() : 'सुरेश पाटील (ग्रामसेवक)',
                    'status': 'सर्वानुमते मंजूर',
                  });
                });
              }
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('ठराव यशस्वीरित्या नोंदवला गेला!'), backgroundColor: GovdTheme.emeraldDark),
              );
            },
            child: const Text('ठराव नोंदवा'),
          ),
        ],
      ),
    );
  }
}
