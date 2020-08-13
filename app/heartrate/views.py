from flask import Blueprint, render_template
from BOFS.util import *
from BOFS.globals import db

heartrate = Blueprint('heartrate',
                      __name__,
                      static_url_path='/heartrate',
                      template_folder='templates',
                      static_folder='static')


@heartrate.route("/hr_start")
@verify_session_valid
@verify_correct_page
def route_heartrate_start():
    return render_template("start.html")


# TWITCH PAGES START
@heartrate.route("/twitch_stream_1")
@verify_session_valid
@verify_correct_page
def route_twitch_stream_1():
    return render_template("twitch_stream.html")


@heartrate.route("/twitch_stream_2")
@verify_session_valid
@verify_correct_page
def route_twitch_stream_2():
    return render_template("twitch_stream.html")


@heartrate.route("/twitch_stream_3")
@verify_session_valid
@verify_correct_page
def route_twitch_stream_3():
    return render_template("twitch_stream.html")


# TWITCH PAGES END


@heartrate.route("/updater1")
@verify_session_valid
@verify_correct_page
def route_updater1():
    return render_template("updater.html")


@heartrate.route("/updater2")
@verify_session_valid
@verify_correct_page
def route_updater2():
    return render_template("updater.html")


@heartrate.route("/updater3")
@verify_session_valid
@verify_correct_page
def route_updater3():
    return render_template("updater.html")


@heartrate.route("/email_redirecter")
@verify_session_valid
@verify_correct_page
def route_email_redirecter():
    return render_template("email_redirecter.html")


# @heartrate.route("/email_checker")
# @verify_session_valid
# @verify_correct_page
# def route_heartrate_emailCheck():
#     return render_template("end_emailChecker.html")


@heartrate.route("/hr_end")
@verify_session_valid
@verify_correct_page
def route_heartrate_end():
    return render_template("end.html")


@heartrate.route("/hr_window")
@verify_session_valid
def route_heartrate_window():
    return render_template("window.html")


@heartrate.route("/hr_submit", methods=['POST'])
def route_heartrate_submit():
    timeStampUnixList = str(request.form['timestampUnix']).split(",")[:-1]
    bpmList = str(request.form['bpm']).split(",")[:-1]
    fqQualityList = str(request.form['fqQuality']).split(",")[:-1]
    dataQualityList = str(request.form['dataQuality']).split(",")[:-1]

    for i in range(len(bpmList)):
        hr = db.HeartRate()
        hr.participantID = int(session['participantID'])
        hr.timeStampUnix = timeStampUnixList[i]
        hr.heartRate = bpmList[i]
        hr.fqQuality = fqQualityList[i]
        hr.dataQuality = dataQualityList[i]
        hr.url = request.form['url']

        db.session.add(hr)

    db.session.commit()

    return ""