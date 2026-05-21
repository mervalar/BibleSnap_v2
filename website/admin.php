<?php

session_start();
require_once __DIR__ . '/db.php';

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

// Handle login POST
$loginError = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if ($_POST['password'] === ADMIN_PASSWORD) {
        $_SESSION['admin_ok'] = true;
        header('Location: admin.php');
        exit;
    }
    $loginError = 'Incorrect password.';
}

$isAuth = !empty($_SESSION['admin_ok']);

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
if (!$isAuth): ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BibleSnap — Admin Login</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:linear-gradient(135deg,#F5EFE6 0%,#EDE3D0 100%);min-height:100vh;display:flex;align-items:center;justify-content:center}
.card{background:#fff;backdrop-filter:blur(20px);border:1px solid #E7DBC8;border-radius:24px;padding:48px 40px;width:100%;max-width:400px;text-align:center;box-shadow:0 8px 40px rgba(139,93,51,0.12)}
.logo{font-family:'Playfair Display',serif;font-size:28px;color:#2D2417;margin-bottom:8px}
.logo span{background:linear-gradient(135deg,#C9A227,#A67C52);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.subtitle{font-size:13px;color:#8B7355;margin-bottom:36px;letter-spacing:2px;text-transform:uppercase}
.error{background:rgba(244,67,54,0.08);border:1px solid rgba(244,67,54,0.2);color:#C0392B;padding:10px 16px;border-radius:10px;font-size:14px;margin-bottom:20px}
input[type=password]{width:100%;padding:14px 18px;background:#FBF7F0;border:1px solid #E7DBC8;border-radius:12px;color:#2D2417;font-size:15px;outline:none;margin-bottom:16px;transition:border-color 0.2s}
input[type=password]::placeholder{color:#B8A88A}
input[type=password]:focus{border-color:#C9A227}
button{width:100%;padding:14px;background:#2D2417;border:none;border-radius:12px;color:#fff;font-size:15px;font-weight:600;cursor:pointer;transition:opacity 0.2s}
button:hover{opacity:0.85}
.back{display:inline-block;margin-top:20px;color:#8B7355;font-size:13px;text-decoration:none;transition:color 0.2s}
.back:hover{color:#2D2417}
</style>
</head>
<body>
<div class="card">
    <div class="logo"><img src="images/biblesnap-logo.png" style="width:32px;height:32px;border-radius:8px;object-fit:cover;vertical-align:middle;margin-right:8px" alt="">Bible<span>Snap</span></div>
    <p class="subtitle">Admin Panel</p>
    <?php if ($loginError): ?>
        <div class="error"><?= htmlspecialchars($loginError) ?></div>
    <?php endif; ?>
    <form method="POST">
        <input type="password" name="password" placeholder="Enter admin password" autofocus required>
        <button type="submit">Sign In</button>
    </form>
    <a href="index.php" class="back">← Back to website</a>
</div>
</body>
</html>
<?php
exit;
endif;

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
$db = getDb();

$totalVisits      = (int) $db->query("SELECT COUNT(*) FROM page_visits")->fetchColumn();
$totalSubs        = (int) $db->query("SELECT COUNT(*) FROM waitlist_entries")->fetchColumn();
$todayVisits      = (int) $db->query("SELECT COUNT(*) FROM page_visits WHERE date(created_at)=date('now')")->fetchColumn();
$todaySubs        = (int) $db->query("SELECT COUNT(*) FROM waitlist_entries WHERE date(created_at)=date('now')")->fetchColumn();
$subscribers      = $db->query("SELECT email, ip_address, created_at FROM waitlist_entries ORDER BY created_at DESC")->fetchAll();

// Last 7 days chart data
$chartData = [];
for ($i = 6; $i >= 0; $i--) {
    $date  = date('Y-m-d', strtotime("-$i days"));
    $label = date('D', strtotime("-$i days"));
    $visits = (int) $db->query("SELECT COUNT(*) FROM page_visits WHERE date(created_at)='$date'")->fetchColumn();
    $subs   = (int) $db->query("SELECT COUNT(*) FROM waitlist_entries WHERE date(created_at)='$date'")->fetchColumn();
    $chartData[] = ['label' => $label, 'visits' => $visits, 'subs' => $subs];
}
$maxVisits = max(1, ...array_column($chartData, 'visits'));
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BibleSnap — Admin Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#F5F0E8;--sidebar:#FBF7F0;--primary:#8B5D33;--gold:#C9A227;--text:#2D2417;--text2:#5A4A33;--border:#E7DBC8;--white:#fff}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);display:flex;min-height:100vh}

/* SIDEBAR */
.sidebar{width:240px;background:var(--sidebar);border-right:1px solid var(--border);padding:32px 20px;display:flex;flex-direction:column;gap:0;position:fixed;height:100vh;overflow-y:auto}
.s-logo{font-family:'Playfair Display',serif;font-size:20px;color:var(--text);display:flex;align-items:center;gap:10px;margin-bottom:4px}
.s-badge{font-size:11px;color:var(--text2);letter-spacing:2px;text-transform:uppercase;margin-bottom:36px;padding-left:2px}
.s-label{font-size:11px;color:#B8A88A;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;padding-left:12px}
.s-link{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;color:var(--text2);text-decoration:none;font-size:14px;transition:all 0.2s;margin-bottom:2px}
.s-link:hover,.s-link.active{background:rgba(139,93,51,0.08);color:var(--primary)}
.s-divider{height:1px;background:var(--border);margin:20px 0}
.s-logout{margin-top:auto;display:block;padding:12px;text-align:center;background:rgba(244,67,54,0.06);border:1px solid rgba(244,67,54,0.15);border-radius:10px;color:#C0392B;text-decoration:none;font-size:13px;transition:background 0.2s}
.s-logout:hover{background:rgba(244,67,54,0.12)}

/* MAIN */
.main{margin-left:240px;flex:1;padding:40px 48px}
.page-title{font-family:'Playfair Display',serif;font-size:32px;color:var(--text);margin-bottom:4px}
.page-sub{font-size:14px;color:var(--text2);margin-bottom:36px}

/* STAT CARDS */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:36px}
.stat-card{background:var(--white);border-radius:16px;padding:24px;border:1px solid var(--border);transition:transform 0.2s,box-shadow 0.2s}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(139,93,51,0.1)}
.stat-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:16px}
.stat-icon.brown{background:linear-gradient(135deg,#8B5D33,#A67C52)}
.stat-icon.gold{background:linear-gradient(135deg,#C9A227,#E8C547)}
.stat-icon.green{background:linear-gradient(135deg,#4A6741,#6A8A61)}
.stat-icon.dark{background:linear-gradient(135deg,#8B5D33,#6B4025)}
.stat-number{font-family:'Playfair Display',serif;font-size:36px;font-weight:700;color:var(--text);line-height:1}
.stat-label{font-size:13px;color:var(--text2);margin-top:6px}
.stat-delta{font-size:12px;color:#4A7742;font-weight:500;margin-top:4px}

/* CHART */
.chart-card{background:var(--white);border-radius:16px;padding:28px;border:1px solid var(--border);margin-bottom:28px}
.card-title{font-size:16px;font-weight:600;color:var(--text);margin-bottom:6px}
.card-sub{font-size:13px;color:var(--text2);margin-bottom:24px}
.chart-wrap{display:flex;align-items:flex-end;gap:8px;height:120px}
.chart-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px}
.chart-bar-wrap{flex:1;display:flex;align-items:flex-end;width:100%}
.chart-bar{width:100%;border-radius:6px 6px 0 0;transition:height 0.3s;min-height:4px}
.chart-bar.visits{background:linear-gradient(180deg,#C9A227,#A67C52)}
.chart-bar.subs{background:linear-gradient(180deg,#4A6741,#6A8A61);width:50%;margin:0 auto}
.chart-day{font-size:11px;color:var(--text2)}
.chart-legend{display:flex;gap:20px;margin-top:16px}
.legend-item{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text2)}
.legend-dot{width:10px;height:10px;border-radius:2px}

/* TABLE */
.table-card{background:var(--white);border-radius:16px;padding:28px;border:1px solid var(--border)}
.table-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.export-btn{padding:8px 18px;background:linear-gradient(135deg,#8B5D33,#A67C52);border:none;border-radius:8px;color:#fff;font-size:13px;font-weight:500;cursor:pointer;text-decoration:none}
.search-box{padding:8px 14px;border:1px solid var(--border);border-radius:8px;font-size:13px;outline:none;color:var(--text);transition:border-color 0.2s;background:var(--bg)}
.search-box:focus{border-color:var(--primary)}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:12px;font-weight:600;color:var(--text2);letter-spacing:0.5px;text-transform:uppercase;padding:0 0 12px;border-bottom:1px solid var(--border)}
td{padding:14px 0;border-bottom:1px solid rgba(231,219,200,0.5);font-size:14px;color:var(--text)}
tr:last-child td{border-bottom:none}
.email-cell{font-weight:500}
.ip-cell{color:var(--text2);font-size:13px}
.date-cell{color:var(--text2);font-size:13px}
.badge-new{background:rgba(74,103,65,0.12);color:#4A6741;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;margin-left:8px}
.empty{text-align:center;padding:40px;color:var(--text2);font-size:14px}
</style>
</head>
<body>

<!-- SIDEBAR -->
<aside class="sidebar">
    <div class="s-logo"><img src="images/biblesnap-logo.png" style="width:28px;height:28px;border-radius:8px;object-fit:cover;flex-shrink:0" alt="">BibleSnap</div>
    <p class="s-badge">Admin Panel</p>
    <p class="s-label">Overview</p>
    <a href="admin.php" class="s-link active"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Dashboard</a>
    <div class="s-divider"></div>
    <p class="s-label">Site</p>
    <a href="index.php" target="_blank" class="s-link"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> View Website</a>
    <div class="s-divider"></div>
    <a href="admin.php?logout=1" class="s-logout">Sign out</a>
</aside>

<!-- MAIN -->
<main class="main">
    <h1 class="page-title">Dashboard</h1>
    <p class="page-sub">Last updated: <?= date('F j, Y \a\t g:i A') ?></p>

    <!-- STAT CARDS -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon brown"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
            <div class="stat-number"><?= number_format($totalVisits) ?></div>
            <div class="stat-label">Total page visits</div>
            <div class="stat-delta">+<?= $todayVisits ?> today</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon gold"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
            <div class="stat-number"><?= number_format($totalSubs) ?></div>
            <div class="stat-label">Waitlist members</div>
            <div class="stat-delta">+<?= $todaySubs ?> today</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            <div class="stat-number"><?= $todayVisits ?></div>
            <div class="stat-label">Visits today</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon dark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg></div>
            <div class="stat-number"><?= $totalVisits > 0 ? round(($totalSubs / $totalVisits) * 100) : 0 ?>%</div>
            <div class="stat-label">Conversion rate</div>
        </div>
    </div>

    <!-- CHART -->
    <div class="chart-card">
        <div class="card-title">Last 7 days</div>
        <p class="card-sub">Page visits and new waitlist signups per day</p>
        <div class="chart-wrap">
            <?php foreach ($chartData as $day): ?>
            <div class="chart-col">
                <div class="chart-bar-wrap">
                    <div class="chart-bar visits" style="height:<?= $maxVisits > 0 ? round(($day['visits'] / $maxVisits) * 100) : 0 ?>%"></div>
                </div>
                <div class="chart-day"><?= $day['label'] ?></div>
            </div>
            <?php endforeach; ?>
        </div>
        <div class="chart-legend">
            <div class="legend-item"><div class="legend-dot" style="background:linear-gradient(135deg,#C9A227,#A67C52)"></div>Visits</div>
            <div class="legend-item"><div class="legend-dot" style="background:linear-gradient(135deg,#4A6741,#6A8A61)"></div>Signups</div>
        </div>
    </div>

    <!-- TABLE -->
    <div class="table-card">
        <div class="table-header">
            <div>
                <div class="card-title">Waitlist members</div>
                <p class="card-sub" style="margin:0"><?= $totalSubs ?> total</p>
            </div>
            <div style="display:flex;gap:12px;align-items:center">
                <input type="text" class="search-box" placeholder="Search email..." id="searchInput" onkeyup="filterTable()">
                <a href="export.php" class="export-btn">Export CSV</a>
            </div>
        </div>

        <?php if (empty($subscribers)): ?>
            <div class="empty">No subscribers yet. Share your landing page! 🙏</div>
        <?php else: ?>
        <table id="subsTable">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Email</th>
                    <th>IP Address</th>
                    <th>Joined</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($subscribers as $i => $sub):
                    $isToday = date('Y-m-d', strtotime($sub['created_at'])) === date('Y-m-d');
                ?>
                <tr>
                    <td><?= $totalSubs - $i ?></td>
                    <td class="email-cell">
                        <?= htmlspecialchars($sub['email']) ?>
                        <?php if ($isToday): ?><span class="badge-new">New</span><?php endif; ?>
                    </td>
                    <td class="ip-cell"><?= htmlspecialchars($sub['ip_address'] ?? '—') ?></td>
                    <td class="date-cell"><?= date('M j, Y \a\t g:i A', strtotime($sub['created_at'])) ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php endif; ?>
    </div>
</main>

<script>
function filterTable() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('#subsTable tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}
</script>
</body>
</html>
