import os
from BOFS.create_app import create_app

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")
app = create_app(path, 'hr.cfg')

if __name__ == '__main__':
    # app.debug = True
    app.debug = False

    # app.run()
    app.run('0.0.0.0',
            port=443,
            keyfile='privkey.pem',
            certfile='fullchain.pem')

# app.run('0.0.0.0', port=8515)
# app.run('0.0.0.0', port=8515, keyfile='privkey.pem', certfile='fullchain.pem')

# app.run(host='<home IP>', ssl_context='adhoc') # for hosting on home network

# Needs to be https for twitch embed to work; look at twitch_stream.html
