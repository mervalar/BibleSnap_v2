<?php
namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\starks;

class StarkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        starks::create([
        'category_id' => 10, 
        'title' => 'In the Beginning',
        'main_verse' => 'Genesis 1:1',
        'explanation' => "The Bible starts with God's power in creating everything from nothing. 'In the beginning, God created the heavens and the earth' reminds us that God is the source of all life, order, and purpose.",
        'related_verses' => json_encode([
                [
                    'reference' => 'John 1:1-3',
                    'text' => 'In the beginning was the Word, and the Word was with God, and the Word was God. He was with God in the beginning. Through him all things were made; without him nothing was made that has been made.'
                ],
                [
                    'reference' => 'Hebrews 11:3',
                    'text' => 'By faith we understand that the universe was formed at God\'s command, so that what is seen was not made out of what was visible.'
                ],
                [
                    'reference' => 'Psalm 33:6',
                    'text' => 'By the word of the Lord the heavens were made, their starry host by the breath of his mouth.'
                ]
            ]),
        'did_you_know' => "The word 'Genesis' means 'origin' or 'beginning' in Greek. It sets the foundation for everything we believe as Christians.",
        'activity' => "Go outside and observe something in nature (sky, tree, animal, etc.). Write down what it tells you about God as Creator.",
        'date' => now()->toDateString(),
    ]);
    starks::create([
    'category_id' => 1,
    'title' => 'The Power of Prayer',
    'main_verse' => 'Matthew 7:7',
    'explanation' => "Jesus teaches us that prayer is not just asking, but seeking and knocking with persistence. 'Ask and it will be given to you; seek and you will find; knock and the door will be opened to you' shows God's heart to respond to our prayers.",
    'related_verses' => json_encode([
        [
            'reference' => '1 Thessalonians 5:17',
            'text' => 'Pray continually.'
        ],
        [
            'reference' => 'Philippians 4:6-7',
            'text' => 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.'
        ],
        [
            'reference' => 'James 5:16',
            'text' => 'The prayer of a righteous person is powerful and effective.'
        ]
    ]),
    'did_you_know' => "The word 'prayer' comes from the Latin 'precari' meaning 'to beg' or 'to entreat,' but biblical prayer is actually intimate conversation with our Heavenly Father.",
    'activity' => "Set aside 10 minutes today to pray using the A.C.T.S. method: Adoration (praise God), Confession (admit sins), Thanksgiving (express gratitude), Supplication (make requests).",
    'date' => now()->toDateString(),
]);

starks::create([
    'category_id' => 2,
    'title' => 'A Heart of Thanksgiving',
    'main_verse' => '1 Thessalonians 5:18',
    'explanation' => "Paul instructs us to 'give thanks in all circumstances; for this is God's will for you in Christ Jesus.' Gratitude isn't based on our circumstances but on God's unchanging character and faithfulness.",
    'related_verses' => json_encode([
        [
            'reference' => 'Psalm 100:4',
            'text' => 'Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name.'
        ],
        [
            'reference' => 'Colossians 3:17',
            'text' => 'And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God the Father through him.'
        ],
        [
            'reference' => 'Ephesians 5:20',
            'text' => 'Always giving thanks to God the Father for everything, in the name of our Lord Jesus Christ.'
        ]
    ]),
    'did_you_know' => "Studies show that practicing gratitude can improve mental health, but more importantly, it aligns our hearts with God's perspective on His blessings.",
    'activity' => "Write down 10 specific things you're grateful for today, including both big and small blessings. Share one of them with someone else.",
    'date' => now()->toDateString(),
]);

starks::create([
    'category_id' => 4,
    'title' => 'Hungry for God\'s Word',
    'main_verse' => '2 Timothy 3:16',
    'explanation' => "Paul reminds Timothy that 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.' God's Word is our spiritual food and guide for life.",
    'related_verses' => json_encode([
        [
            'reference' => 'Psalm 119:105',
            'text' => 'Your word is a lamp for my feet, a light on my path.'
        ],
        [
            'reference' => 'Matthew 4:4',
            'text' => 'Man shall not live on bread alone, but on every word that comes from the mouth of God.'
        ],
        [
            'reference' => 'Joshua 1:8',
            'text' => 'Keep this Book of the Law always on your lips; meditate on it day and night, so that you may be careful to do everything written in it.'
        ]
    ]),
    'did_you_know' => "The Bible contains 66 books written over approximately 1,500 years by about 40 different authors, yet it maintains perfect unity in its message about God's love.",
    'activity' => "Choose a psalm today and read it three times: once for understanding, once for personal application, and once as a prayer to God.",
    'date' => now()->toDateString(),
]);

starks::create([
    'category_id' => 5,
    'title' => 'Daily Bread for the Soul',
    'main_verse' => 'Psalm 5:3',
    'explanation' => "David declares, 'In the morning, Lord, you hear my voice; in the morning I lay my requests before you and wait expectantly.' Daily devotions create a rhythm of seeking God first each day.",
    'related_verses' => json_encode([
        [
            'reference' => 'Lamentations 3:22-23',
            'text' => 'Because of the Lord\'s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.'
        ],
        [
            'reference' => 'Mark 1:35',
            'text' => 'Very early in the morning, while it was still dark, Jesus got up, left the house and went off to a solitary place, where he prayed.'
        ],
        [
            'reference' => 'Psalm 143:8',
            'text' => 'Let the morning bring me word of your unfailing love, for I have put my trust in you.'
        ]
    ]),
    'did_you_know' => "The word 'devotion' comes from the Latin 'devotus,' meaning 'to vow' or 'to dedicate.' Our daily devotions are acts of dedication to God.",
    'activity' => "Create a simple morning routine that includes 5 minutes of Bible reading, 5 minutes of prayer, and 5 minutes of worship or praise.",
    'date' => now()->toDateString(),
]);
starks::create([
    'category_id' => 6,
    'title' => 'Hearing with Purpose',
    'main_verse' => 'Luke 8:18',
    'explanation' => "Jesus warns, 'Therefore consider carefully how you listen. Whoever has will be given more; whoever does not have, even what they think they have will be taken from them.' Active listening to God's Word requires intentional engagement.",
    'related_verses' => json_encode([
        [
            'reference' => 'James 1:22',
            'text' => 'Do not merely listen to the word, and so deceive yourselves. Do what it says.'
        ],
        [
            'reference' => 'Romans 10:17',
            'text' => 'Faith comes from hearing the message, and the message is heard through the word about Christ.'
        ],
        [
            'reference' => 'Nehemiah 8:3',
            'text' => 'He read it aloud from daybreak till noon as he faced the square before the Water Gate in the presence of the men, women and others who could understand. And all the people listened attentively to the Book of the Law.'
        ]
    ]),
    'did_you_know' => "Taking notes during sermons can increase retention by up to 50% and helps us apply God's Word to our daily lives more effectively.",
    'activity' => "During your next sermon, write down: 1) The main Bible passage, 2) One key point that spoke to you, 3) One specific way you'll apply it this week.",
    'date' => now()->toDateString(),
]);

starks::create([
    'category_id' => 7,
    'title' => 'True Worshipers',
    'main_verse' => 'John 4:24',
    'explanation' => "Jesus tells the woman at the well, 'God is spirit, and his worshipers must worship in the Spirit and in truth.' True worship goes beyond external actions to engage our hearts, minds, and spirits.",
    'related_verses' => json_encode([
        [
            'reference' => 'Psalm 95:6',
            'text' => 'Come, let us bow down in worship, let us kneel before the Lord our Maker.'
        ],
        [
            'reference' => 'Romans 12:1',
            'text' => 'Therefore, I urge you, brothers and sisters, to offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship.'
        ],
        [
            'reference' => 'Revelation 4:11',
            'text' => 'You are worthy, our Lord and God, to receive glory and honor and power, for you created all things, and by your will they were created and have their being.'
        ]
    ]),
    'did_you_know' => "The Hebrew word for worship, 'shachah,' literally means 'to bow down' or 'to prostrate oneself,' showing worship as complete surrender to God.",
    'activity' => "Spend 15 minutes in worship today using different expressions: sing a favorite hymn, read Psalm 103 aloud as praise, and end in silent adoration of God's character.",
    'date' => now()->toDateString(),
]);
starks::create([
    'category_id' => 8,
    'title' => 'Listening for the Shepherd\'s Voice',
    'main_verse' => 'John 10:27',
    'explanation' => "Jesus declares, 'My sheep listen to my voice; I know them, and they follow me.' God speaks to His children, and learning to recognize His voice is essential for following Him faithfully.",
    'related_verses' => json_encode([
        [
            'reference' => '1 Kings 19:12',
            'text' => 'After the earthquake came a fire, but the Lord was not in the fire. And after the fire came a gentle whisper.'
        ],
        [
            'reference' => 'Isaiah 30:21',
            'text' => 'Whether you turn to the right or to the left, your ears will hear a voice behind you, saying, "This is the way; walk in it."'
        ],
        [
            'reference' => 'Psalm 46:10',
            'text' => 'Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.'
        ]
    ]),
    'did_you_know' => "God primarily speaks through His Word, but He also communicates through prayer, circumstances, other believers, and His Spirit's gentle promptings in our hearts.",
    'activity' => "Spend 10 minutes in complete silence today, asking God to speak to your heart. Write down any thoughts, impressions, or Bible verses that come to mind.",
    'date' => now()->toDateString(),
]);
starks::create([
    'category_id' => 9,
    'title' => 'Turning Back to God',
    'main_verse' => '1 John 1:9',
    'explanation' => "John assures us, 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.' Repentance is God's gift that restores our relationship with Him.",
    'related_verses' => json_encode([
        [
            'reference' => 'Acts 3:19',
            'text' => 'Repent, then, and turn to God, so that your sins may be wiped out, that times of refreshing may come from the Lord.'
        ],
        [
            'reference' => '2 Corinthians 7:10',
            'text' => 'Godly sorrow brings repentance that leads to salvation and leaves no regret, but worldly sorrow brings death.'
        ],
        [
            'reference' => 'Luke 15:7',
            'text' => 'I tell you that in the same way there will be more rejoicing in heaven over one sinner who repents than over ninety-nine righteous persons who do not need to repent.'
        ]
    ]),
    'did_you_know' => "The Greek word for repentance, 'metanoia,' literally means 'to change one's mind' or 'to think differently.' It's not just feeling sorry, but turning from sin to God.",
    'activity' => "Take a few minutes for honest self-examination. Confess any specific sins to God, thank Him for His forgiveness, and ask for strength to walk in obedience.",
    'date' => now()->toDateString(),
]);
starks::create([
    'category_id' => 10,
    'title' => 'Sharing What God Has Done',
    'main_verse' => 'Psalm 107:2',
    'explanation' => "The psalmist calls out, 'Let the redeemed of the Lord tell their story—those he redeemed from the lands of the enemy.' Our testimonies are powerful witnesses to God's goodness and grace in our lives.",
    'related_verses' => json_encode([
        [
            'reference' => 'Revelation 12:11',
            'text' => 'They triumphed over him by the blood of the Lamb and by the word of their testimony; they did not love their lives so much as to shrink from death.'
        ],
        [
            'reference' => 'Mark 5:19',
            'text' => 'Go home to your own people and tell them how much the Lord has done for you, and how he has had mercy on you.'
        ],
        [
            'reference' => '1 Peter 3:15',
            'text' => 'Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have.'
        ]
    ]),
    'did_you_know' => "The word 'testimony' comes from the Latin 'testimonium,' meaning 'evidence' or 'witness.' Our stories are evidence of God's reality and love.",
    'activity' => "Write down a brief testimony of one specific way God has worked in your life recently. Practice sharing it in 2-3 sentences with someone this week.",
    'date' => now()->toDateString(),
]);
starks::create([
    'category_id' => 11,
    'title' => 'Growing in Christ\'s Likeness',
    'main_verse' => '2 Peter 3:18',
    'explanation' => "Peter encourages believers to 'grow in the grace and knowledge of our Lord and Savior Jesus Christ.' Spiritual growth is a lifelong process of becoming more like Jesus through God's transforming power.",
    'related_verses' => json_encode([
        [
            'reference' => 'Ephesians 4:15',
            'text' => 'Instead, speaking the truth in love, we will grow to become in every respect the mature body of him who is the head, that is, Christ.'
        ],
        [
            'reference' => '1 Peter 2:2',
            'text' => 'Like newborn babies, crave pure spiritual milk, so that by it you may grow up in your salvation.'
        ],
        [
            'reference' => 'Colossians 1:10',
            'text' => 'So that you may live a life worthy of the Lord and please him in every way: bearing fruit in every good work, growing in the knowledge of God.'
        ]
    ]),
    'did_you_know' => "Spiritual growth, like physical growth, requires proper nutrition (God's Word), exercise (practicing faith), and rest (trusting in God's grace).",
    'activity' => "Identify one area where you want to grow spiritually this month. Choose one specific action you can take daily to develop in that area.",
    'date' => now()->toDateString(),
]);
starks::create([
    'category_id' => 12,
    'title' => 'Our Helper and Guide',
    'main_verse' => 'John 14:26',
    'explanation' => "Jesus promises, 'But the Advocate, the Holy Spirit, whom the Father will send in my name, will teach you all things and will remind you of everything I have said to you.' The Holy Spirit is God's presence dwelling within believers.",
    'related_verses' => json_encode([
        [
            'reference' => 'Galatians 5:22-23',
            'text' => 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.'
        ],
        [
            'reference' => 'Romans 8:26',
            'text' => 'In the same way, the Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us through wordless groans.'
        ],
        [
            'reference' => 'Acts 1:8',
            'text' => 'But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.'
        ]
    ]),
    'did_you_know' => "The Holy Spirit is referred to by many names in Scripture: Advocate, Comforter, Helper, Spirit of Truth, and Spirit of God, showing His multifaceted role in our lives.",
    'activity' => "Throughout your day, practice being aware of the Holy Spirit's presence. Ask Him to guide your words, decisions, and attitudes in each situation you face.",
    'date' => now()->toDateString(),
]);
starks::create([
    'category_id' => 13,
    'title' => 'Meditating on God\'s Truth',
    'main_verse' => 'Psalm 1:2-3',
    'explanation' => "The blessed person 'delights in the law of the Lord, and meditates on his law day and night. That person is like a tree planted by streams of water.' Scripture meditation involves deep, thoughtful reflection on God's Word.",
    'related_verses' => json_encode([
        [
            'reference' => 'Psalm 119:11',
            'text' => 'I have hidden your word in my heart that I might not sin against you.'
        ],
        [
            'reference' => 'Colossians 3:16',
            'text' => 'Let the message of Christ dwell among you richly as you teach and admonish one another with all wisdom through psalms, hymns, and songs from the Spirit, singing to God with gratitude in your hearts.'
        ],
        [
            'reference' => 'Isaiah 55:11',
            'text' => 'So is my word that goes out from my mouth: It will not return to me empty, but will accomplish what I desire and achieve the purpose for which I sent it.'
        ]
    ]),
    'did_you_know' => "The Hebrew word for 'meditate' (hagah) means to mutter, moan, or speak quietly, suggesting that meditation involves speaking God's Word to ourselves repeatedly.",
    'activity' => "Choose one verse that spoke to you recently. Write it on a card and carry it with you today, reading and thinking about it throughout the day.",
    'date' => now()->toDateString(),
]);
starks::create([
    'category_id' => 14,
    'title' => 'Laboring for the Kingdom',
    'main_verse' => 'Matthew 6:33',
    'explanation' => "Jesus instructs us to 'seek first his kingdom and his righteousness, and all these things will be given to you as well.' Kingdom work means prioritizing God's eternal purposes over temporary concerns.",
    'related_verses' => json_encode([
        [
            'reference' => '1 Corinthians 15:58',
            'text' => 'Therefore, my dear brothers and sisters, stand firm. Let nothing move you. Always give yourselves fully to the work of the Lord, because you know that your labor in the Lord is not in vain.'
        ],
        [
            'reference' => 'Matthew 28:19-20',
            'text' => 'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you.'
        ],
        [
            'reference' => 'Colossians 3:23',
            'text' => 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.'
        ]
    ]),
    'did_you_know' => "Jesus mentioned the 'kingdom of heaven' or 'kingdom of God' over 100 times in the Gospels, showing it was central to His teaching and mission.",
    'activity' => "Ask God to show you one specific way you can serve His kingdom this week - whether through acts of service, sharing the Gospel, or supporting missions.",
    'date' => now()->toDateString(),
]);
starks::create([
    'category_id' => 15,
    'title' => 'Who You Are in Him',
    'main_verse' => '2 Corinthians 5:17',
    'explanation' => "Paul declares, 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!' Our identity is not based on our past, performance, or others' opinions, but on Christ's finished work.",
    'related_verses' => json_encode([
        [
            'reference' => '1 Peter 2:9',
            'text' => 'But you are a chosen people, a royal priesthood, a holy nation, God\'s special possession, that you may declare the praises of him who called you out of darkness into his wonderful light.'
        ],
        [
            'reference' => 'Ephesians 2:10',
            'text' => 'For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.'
        ],
        [
            'reference' => 'Romans 8:16-17',
            'text' => 'The Spirit himself testifies with our spirit that we are God\'s children. Now if we are children, then we are heirs—heirs of God and co-heirs with Christ.'
        ]
    ]),
    'did_you_know' => "In Christ, you have over 40 different identity markers in the New Testament, including beloved, chosen, forgiven, redeemed, and victorious.",
    'activity' => "Read 1 Peter 2:9 aloud three times, inserting your name: '[Your name], you are chosen, royal, holy, and God's special possession.' Thank God for your true identity.",
    'date' => now()->toDateString(),
]);
starks::create([
    'category_id' => 1,
    'title' => 'Praying God\'s Will',
    'main_verse' => '1 John 5:14',
    'explanation' => "John teaches that 'this is the confidence we have in approaching God: that if we ask anything according to his will, he hears us.' Mature prayer aligns our hearts with God's purposes and desires.",
    'related_verses' => json_encode([
        [
            'reference' => 'Matthew 26:39',
            'text' => 'Going a little farther, he fell with his face to the ground and prayed, "My Father, if it is possible, may this cup be taken from me. Yet not as I will, but as you will."'
        ],
        [
            'reference' => 'Romans 8:27',
            'text' => 'And he who searches our hearts knows the mind of the Spirit, because the Spirit intercedes for God\'s people in accordance with the will of God.'
        ],
        [
            'reference' => 'Jeremiah 33:3',
            'text' => 'Call to me and I will answer you and tell you great and unsearchable things you do not know.'
        ]
    ]),
    'did_you_know' => "Jesus taught His disciples to pray 'Your will be done' in the Lord's Prayer, showing that submitting to God's will is central to Christian prayer.",
    'activity' => "Before making any requests today, spend time asking God what His will might be for your situation. Pray for His will to be done, even if it's different from your desires.",
    'date' => now()->toDateString(),
]);
starks::create([
    'category_id' => 2,
    'title' => 'Thankful in Trials',
    'main_verse' => 'James 1:2-3',
    'explanation' => "James encourages believers to 'consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.' Gratitude in difficulties transforms our perspective.",
    'related_verses' => json_encode([
        [
            'reference' => 'Romans 8:28',
            'text' => 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.'
        ],
        [
            'reference' => '2 Corinthians 12:9',
            'text' => 'But he said to me, "My grace is sufficient for you, for my power is made perfect in weakness." Therefore I will boast all the more gladly about my weaknesses, so that Christ\'s power may rest on me.'
        ],
        [
            'reference' => 'Habakkuk 3:17-18',
            'text' => 'Though the fig tree does not bud and there are no grapes on the vines, though the olive crop fails and the fields produce no food, yet I will rejoice in the Lord, I will be joyful in God my Savior.'
        ]
    ]),
    'did_you_know' => "The Greek word for 'consider' in James 1:2 is an accounting term, meaning to 'calculate' or 'evaluate' - we can choose our perspective on trials.",
    'activity' => "Think of a current challenge you're facing. Write down three ways this situation could be used by God for good in your life or the lives of others.",
    'date' => now()->toDateString(),
]);
starks::create([
    'category_id' => 3,
    'title' => 'Faith That Moves Mountains',
    'main_verse' => 'Matthew 17:20',
    'explanation' => "Jesus tells His disciples, 'Truly I tell you, if you have faith as small as a mustard seed, you can say to this mountain, 'Move from here to there,' and it will move. Nothing will be impossible for you.' Bold faith sets audacious goals for God's glory.",
    'related_verses' => json_encode([
        [
            'reference' => 'Ephesians 3:20',
            'text' => 'Now to him who is able to do immeasurably more than all we ask or imagine, according to his power that is at work within us.'
        ],
        [
            'reference' => 'Hebrews 11:6',
            'text' => 'And without faith it is impossible to please God, because anyone who comes to him must believe that he exists and that he rewards those who earnestly seek him.'
        ],
        [
            'reference' => 'Mark 9:23',
            'text' => '"If you can"? said Jesus. "Everything is possible for one who believes."'
        ]
    ]),
    'did_you_know' => "A mustard seed is one of the smallest seeds, yet it grows into a large tree. Jesus used this metaphor to show that small faith can accomplish great things.",
    'activity' => "Pray about one 'impossible' situation in your life or community. Ask God if He wants you to step out in faith and trust Him for something that seems too big.",
    'date' => now()->toDateString(),
]);
starks::create([
    'category_id' => 4,
    'title' => 'Rightly Dividing the Word',
    'main_verse' => '2 Timothy 2:15',
    'explanation' => "Paul instructs Timothy to 'do your best to present yourself to God as one approved, a worker who does not need to be ashamed and who correctly handles the word of truth.' Careful Bible study requires diligence and proper interpretation.",
    'related_verses' => json_encode([
        [
            'reference' => 'Acts 17:11',
            'text' => 'Now the Berean Jews were of more noble character than those in Thessalonica, for they received the message with great eagerness and examined the Scriptures every day to see if what Paul said was true.'
        ],
        [
            'reference' => 'Ezra 7:10',
            'text' => 'For Ezra had devoted himself to the study and observance of the Law of the Lord, and to teaching its decrees and laws in Israel.'
        ],
        [
            'reference' => '1 Corinthians 2:13',
            'text' => 'This is what we speak, not in words taught us by human wisdom but in words taught by the Spirit, explaining spiritual realities with Spirit-taught words.'
        ]
    ]),
    'did_you_know' => "The phrase 'rightly dividing' in the original Greek means 'cutting straight' - like a craftsman making precise cuts. We need precision in handling God's Word.",
    'activity' => "Choose a passage you've read before and study it using these steps: 1) What does it say? 2) What does it mean? 3) How does it apply to my life?",
    'date' => now()->toDateString(),
]);

    }
    
}
