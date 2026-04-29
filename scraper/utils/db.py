from prisma import Prisma

async def get_db():
    db = Prisma()
    await db.connect()
    return db

async def save_snapshot(db, snapshot: dict):
    await db.boxofficesnapshot.create(data={
        'movieTitle': snapshot['movie'],
        'timestamp': snapshot['timestamp'],
        'showTime': snapshot.get('show_time'),
        'ticketsSold': snapshot['tickets_sold_this_hour'],
        'cumulative': snapshot.get('cumulative_tickets'),
        'city': snapshot.get('city'),
        'chain': snapshot.get('chain', 'BMS'),
        'deltaPercent': snapshot.get('delta_vs_yesterday'),
    })