__author__ = 'Fei'
from sqlite_util import *
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages

from datetime import datetime

def select_info_using_videoID(videoID):
    q_distinct_video_duration = "SELECT MAX(duration) AS uniqueDuration, url AS yt_url, videoID FROM youtube GROUP BY yt_url"
    q_start_timestamp = "SELECT timestamp " + \
                        "FROM (" + q_distinct_video_duration + "), youtubeLog " + \
                        "WHERE yt_url = youtubeLog.url " + \
                        "AND videoID = " + str(videoID) + " AND (playerState = -1.0 OR playerState = 1.0) ORDER BY timestamp LIMIT 1"

    query = "SELECT timestamp-(" + q_start_timestamp + ") AS seconds, currentTime, " + \
            "currentLoadedFraction*uniqueDuration AS currentLoadedTime, (currentLoadedFraction*uniqueDuration - currentTime) AS timeDiff, " + \
            "playerState " + \
            "FROM (" + q_distinct_video_duration + "), youtubeLog " + \
            "WHERE yt_url = youtubeLog.url " + \
            "AND videoID = " + str(videoID) + " ORDER BY timestamp;"

    return query

def get_newest_videoID(num):
    query = "SELECT videoID, MAX(duration), availableQ, availableR FROM youtube GROUP BY url ORDER BY videoId DESC LIMIT {}".format(str(num))
    cursor = sc.execute(query)
    for row in cursor:
        yield row

def plot(video_info, cur_videoID):
    fig = plt.figure(1, figsize=(11.7,8.3))
    ax = fig.add_subplot(111)
    subplot_margin = 0.04
    plt.subplots_adjust(left=subplot_margin, right=1-subplot_margin, top=1-subplot_margin, bottom=subplot_margin)
    ax.plot(video_info['seconds'],video_info['currenttime'], video_info['seconds'], video_info['currentloadedtime'] \
           ,linestyle='--', marker = 'o')

    ind_state_change = numpy.where(video_info['playerstate'][:-1]!=video_info['playerstate'][1:])

    ax.plot( video_info['seconds'][1:][ind_state_change], video_info['currenttime'][1:][ind_state_change]\
           ,linestyle='None', marker = r'$\circlearrowleft$',markersize=30, alpha = 0.5)
    ax.set_title(str(list(cur_videoID)))
    plt.legend(['current time','current loaded time'], loc='best')
    plt.savefig(pdf, format='pdf')
    plt.close()

sc = SqliteConnection('12')
pdf = PdfPages('plot'+ datetime.now().strftime('%a_%b_%d_%H_%M_%S') + '.pdf')
for i in get_newest_videoID(10):
    plot(sc.execute(select_info_using_videoID(i[0]), asarray=True), i)

pdf.close()

# a = sc.execute(select_info_using_videoID(1), asarray=True)
# print a.dtype
# print a
