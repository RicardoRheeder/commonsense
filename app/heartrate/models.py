def create(db):
    class HeartRate(db.Model):
        __tablename__ = "heart_rate"

        heartRateID = db.Column(db.Integer, primary_key=True, autoincrement=True)
        participantID = db.Column(db.Integer, db.ForeignKey('participant.participantID'))
        timeStampUnix = db.Column(db.Integer, nullable=False, default=0)
        heartRate = db.Column(db.Float, nullable=False, default=0.0)
        fqQuality = db.Column(db.Float, nullable=False, default=0.0)
        dataQuality = db.Column(db.Float, nullable=False, default=0.0)
        url = db.Column(db.String(255), nullable=False, default="")

    return HeartRate
