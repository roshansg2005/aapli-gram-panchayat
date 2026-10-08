import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../../config/theme.dart';
import '../certificates/certificates_list_screen.dart';
import '../taxes/tax_records_screen.dart';
import '../grievances/grievances_list_screen.dart';
import '../schemes/schemes_list_screen.dart';
import '../notices/notices_screen.dart';
import '../directory/directory_screen.dart';

class AiChatMessage {
  final String text;
  final bool isUser;
  final String time;
  final String? actionText;
  final String? actionType;
  final List<String>? suggestedChips;

  AiChatMessage({
    required this.text,
    required this.isUser,
    required this.time,
    this.actionText,
    this.actionType,
    this.suggestedChips,
  });
}

class AiGramMitraModal extends StatefulWidget {
  const AiGramMitraModal({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const AiGramMitraModal(),
    );
  }

  @override
  State<AiGramMitraModal> createState() => _AiGramMitraModalState();
}

class _AiGramMitraModalState extends State<AiGramMitraModal> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<AiChatMessage> _messages = [];
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    // Initial AI Greeting
    final isMr = context.read<AppProvider>().language == 'mr';
    _messages.add(
      AiChatMessage(
        text: isMr
            ? '🙏 **नमस्ते! मी आपला AI ग्राम मित्र आहे.**\n\n'
                'आपल्या ग्रामपंचायतीचे दाखले, कर भरणा, शासकीय योजना व नागरी समस्यांबद्दल मी आपल्याला मदत करू शकतो. आपल्याला काय माहिती हवी आहे?'
            : '🙏 **Namaste! I am your AI Gram Mitra.**\n\n'
                'I can assist you with certificates, taxes, welfare schemes, and civic complaints. How can I help you today?',
        isUser: false,
        time: 'आत्ता',
        suggestedChips: isMr
            ? ['💰 १०% कर सवलत माहिती', '📜 जन्म व रहिवासी दाखला', '🌾 शेतकरी व घरकुल योजना', '💧 पाणीपुरवठा तक्रार']
            : ['💰 10% Tax Rebate', '📜 Residence Certificate', '🌾 Housing & Farmer Schemes', '💧 Water Complaint'],
      ),
    );
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _handleSubmitted(String text) {
    if (text.trim().isEmpty) return;

    final app = context.read<AppProvider>();
    final query = text.trim();
    _textController.clear();

    setState(() {
      _messages.add(
        AiChatMessage(
          text: query,
          isUser: true,
          time: 'आत्ता',
        ),
      );
      _isTyping = true;
    });
    _scrollToBottom();

    // Simulate AI Thinking & Generation
    Future.delayed(const Duration(milliseconds: 600), () {
      if (!mounted) return;
      final aiResponse = app.askGramMitra(query);

      setState(() {
        _isTyping = false;
        _messages.add(
          AiChatMessage(
            text: aiResponse['response'] as String,
            isUser: false,
            time: 'आत्ता',
            actionText: aiResponse['actionText'] as String?,
            actionType: aiResponse['actionType'] as String?,
            suggestedChips: (aiResponse['suggestedChips'] as List<String>?),
          ),
        );
      });
      _scrollToBottom();
    });
  }

  void _triggerAction(String? actionType) {
    if (actionType == null) return;
    Navigator.of(context).pop(); // Close sheet

    switch (actionType) {
      case 'apply_certificate':
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CertificatesListScreen()));
        break;
      case 'pay_tax':
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const TaxRecordsScreen()));
        break;
      case 'view_schemes':
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SchemesListScreen()));
        break;
      case 'lodge_grievance':
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const GrievancesListScreen()));
        break;
      case 'view_notices':
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const NoticesScreen()));
        break;
      case 'view_directory':
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const DirectoryScreen()));
        break;
      default:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppProvider>();
    final isDark = app.isDarkMode;
    final isMr = app.language == 'mr';

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        children: [
          // 🌟 Top AI Header
          Container(
            padding: const EdgeInsets.fromLTRB(20, 14, 16, 14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF4F46E5), Color(0xFF7C3AED), Color(0xFFDB2777)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: Column(
              children: [
                Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.4),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white.withOpacity(0.4)),
                      ),
                      child: const Icon(Icons.auto_awesome, color: Color(0xFFFDE68A), size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                isMr ? 'AI ग्राम मित्र' : 'AI Gram Mitra',
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Text(
                                  '24x7 ONLINE',
                                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            isMr ? 'आपले बुद्धिमान डिजिटल ग्राम मार्गदर्शक' : 'Your Smart Civic Assistant',
                            style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.9)),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.white),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // 💬 Chat Messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length && _isTyping) {
                  return Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 6),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF7C3AED)),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            isMr ? 'ग्राम मित्र विचार करत आहे...' : 'AI Mitra is thinking...',
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                final msg = _messages[index];
                return _buildMessageItem(msg, isDark, isMr);
              },
            ),
          ),

          // 💡 Suggestion Chips if available from last message
          if (_messages.isNotEmpty && _messages.last.suggestedChips != null && _messages.last.suggestedChips!.isNotEmpty)
            Container(
              height: 42,
              margin: const EdgeInsets.only(bottom: 6),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _messages.last.suggestedChips!.length,
                itemBuilder: (context, idx) {
                  final chip = _messages.last.suggestedChips![idx];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ActionChip(
                      label: Text(chip),
                      labelStyle: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isDark ? const Color(0xFF818CF8) : const Color(0xFF4F46E5),
                      ),
                      backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFEEF2FF),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: BorderSide(
                          color: isDark ? const Color(0xFF4F46E5).withOpacity(0.5) : const Color(0xFFC7D2FE),
                        ),
                      ),
                      onPressed: () => _handleSubmitted(chip),
                    ),
                  );
                },
              ),
            ),

          // ⌨️ Input Bar with Voice Simulation & Send
          Container(
            padding: const EdgeInsets.fromLTRB(14, 8, 14, 14),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF131C2E) : Colors.white,
              border: Border(
                top: BorderSide(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                ),
              ),
            ),
            child: Row(
              children: [
                // Quick Voice Simulation Button
                IconButton(
                  icon: const Icon(Icons.mic_rounded, color: Color(0xFF7C3AED)),
                  tooltip: isMr ? 'व्हॉइस सर्च' : 'Voice Search',
                  onPressed: () {
                    final isMr = app.language == 'mr';
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(isMr ? '🎤 ऐकत आहे... (बोलण्यास सुरुवात करा)' : '🎤 Listening... (Speak now)'),
                        duration: const Duration(seconds: 2),
                        backgroundColor: const Color(0xFF7C3AED),
                      ),
                    );
                    _handleSubmitted(isMr ? 'घरपट्टी कर सवलत माहिती' : 'Tax rebate information');
                  },
                ),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                      ),
                    ),
                    child: TextField(
                      controller: _textController,
                      style: TextStyle(
                        fontSize: 13.5,
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                      ),
                      decoration: InputDecoration(
                        hintText: isMr ? 'काहीही विचारा (दाखला, कर, योजना, तक्रार)...' : 'Ask anything (Certificates, tax, schemes)...',
                        hintStyle: TextStyle(
                          fontSize: 12.5,
                          color: isDark ? const Color(0xFF64748B) : const Color(0xFF94A3B8),
                        ),
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                      onSubmitted: _handleSubmitted,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
                    ),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                    onPressed: () => _handleSubmitted(_textController.text),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageItem(AiChatMessage msg, bool isDark, bool isMr) {
    if (msg.isUser) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 6),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
            ),
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(4),
              bottomLeft: Radius.circular(20),
              bottomRight: Radius.circular(20),
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF7C3AED).withOpacity(0.2),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            msg.text,
            style: const TextStyle(
              fontSize: 13.5,
              fontWeight: FontWeight.w500,
              color: Colors.white,
              height: 1.4,
            ),
          ),
        ),
      );
    }

    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.all(14),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.88),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(4),
            topRight: Radius.circular(20),
            bottomLeft: Radius.circular(20),
            bottomRight: Radius.circular(20),
          ),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.auto_awesome, color: Colors.white, size: 12),
                ),
                const SizedBox(width: 6),
                Text(
                  isMr ? 'AI ग्राम मित्र सहाय्यक' : 'AI Gram Mitra Guide',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: isDark ? const Color(0xFFA5B4FC) : const Color(0xFF4F46E5),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              msg.text,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? const Color(0xFFF1F5F9) : const Color(0xFF1E293B),
                height: 1.5,
              ),
            ),
            if (msg.actionText != null) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  onPressed: () => _triggerAction(msg.actionType),
                  child: Text(
                    msg.actionText!,
                    style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
