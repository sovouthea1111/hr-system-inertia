<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { text-align: center; margin-bottom: 30px; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: right; font-size: 10px; }
        .total-section { margin-top: 20px; text-align: right; font-weight: bold; }
        .status-approved { color: green; }
        .status-pending { color: orange; }
        .status-rejected { color: red; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Generated on: {{ $date }}</p>
        <p>User: {{ $user->name }} ({{ $user->email }})</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Employee Name</th>
                <th>Date & Time Range</th>
                <th>Type</th>
                <th>Hours</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($overtimes as $ot)
            <tr>
                <td>{{ $ot['employee_name'] }}</td>
                <td>
                    {{ \Carbon\Carbon::parse($ot['overtime_date'])->format('Y-m-d') }}
                    <br>
                    <small>({{ \Carbon\Carbon::parse($ot['start_time'])->format('H:i') }} - {{ \Carbon\Carbon::parse($ot['end_time'])->format('H:i') }})</small>
                </td>
                <td>{{ ucfirst($ot['overtime_type'] ?? 'regular') }}</td>
                <td>{{ $ot['hours_worked'] }}</td>
                <td>${{ number_format($ot['hourly_rate'] ?? 0, 2) }}</td>
                <td>${{ number_format($ot['total_amount'] ?? 0, 2) }}</td>
                <td class="status-{{ $ot['status'] }}">{{ ucfirst($ot['status']) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-section">
        <p>Total Hours: {{ $total_hours }}</p>
        <p>Total Amount: ${{ number_format($total_amount, 2) }}</p>
    </div>

    <div class="footer">
        Page 1
    </div>
</body>
</html>
