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
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($leaves as $leave)
            <tr>
                <td>{{ $leave->employee->full_name }}</td>
                <td>{{ ucfirst($leave->leave_type) }}</td>
                <td>{{ $leave->start_date->format('Y-m-d') }}</td>
                <td>{{ $leave->end_date->format('Y-m-d') }}</td>
                <td>{{ $leave->days_requested }}</td>
                <td class="status-{{ $leave->status }}">{{ ucfirst($leave->status) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Page 1
    </div>
</body>
</html>
