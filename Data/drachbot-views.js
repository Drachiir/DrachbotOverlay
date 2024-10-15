var React = window.React;
var ReactDOM = window.ReactDOM;

var DrachbotOverlay = React.createClass({
    getInitialState: function () {
        return {
            data: null,
            loading: false,
            error: null
        };
    },
    componentDidMount: function () {
        this._isMounted = true;
        if (this.props.playername) {
            this.fetchData(this.props.playername);
        }
    },
    componentDidUpdate: function (prevProps) {
        if (this.props.playername !== prevProps.playername) {
            this.fetchData(this.props.playername);
        }
    },
    componentWillUnmount: function () {
        this._isMounted = false;
    },
    fetchData: function (playername) {
        if (this.props.queue === 'Classic') {
            return null;
        }
        const url = 'https://stats.drachbot.site/api/drachbot_overlay/' + playername;
        console.log('Fetching URL:', url); // Log the URL

        // Set loading state before starting the request
        this.setState({ loading: true, error: null });

        var xhr;
        if (window.XMLHttpRequest) {
            // Modern browsers
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            // Older versions of Internet Explorer
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            console.error('Your browser does not support AJAX requests.');
            return;
        }

        xhr.open('GET', url, true);

        var self = this; // Preserve the context

        xhr.onload = function () {
            console.log('XHR onload called. Status:', xhr.status);
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    console.log('Data received:', data);
                    // Check if the component is still mounted before updating the state
                    if (self._isMounted) {
                        self.setState({ data: data, loading: false });
                    }
                } catch (error) {
                    console.error('JSON parse error:', error);
                    if (self._isMounted) {
                        self.setState({ error: error, loading: false });
                    }
                }
            } else {
                var error = new Error('Network response was not ok: ' + xhr.statusText);
                console.error('Request error:', error);
                if (self._isMounted) {
                    self.setState({ error: error, loading: false });
                }
            }
        };

        xhr.onerror = function () {
            var error = new Error('Network request failed');
            console.error('Request error:', error);
            if (self._isMounted) {
                self.setState({ error: error, loading: false });
            }
        };

        // Send the request
        xhr.send();
    },
    render: function () {
        if (this.props.queue === 'Classic') {
            return null;
        }
        var data = this.state.data;
        var loading = this.state.loading;
        var error = this.state.error;

        if (loading) {
            return React.createElement('div', { style: {top: '-10px', position: 'absolute'} }, 'Drachbot Loading...');
        }

        if (error) {
            return React.createElement('div', { style: {top: '-10px', position: 'absolute'} }, 'Error: (Player: ' + this.props.playername + ')');
        }

        if (!data) {
            return React.createElement('div', { style: {top: '-10px', position: 'absolute'} }, 'No data available.');
        }

        var eloChange = data.EloChange;
        var eloChangeDisplay = (eloChange > 0 ? '+' : '') + eloChange;
        var styles = {
            overlay: {
                position: 'absolute',
                whiteSpace: 'nowrap',
                padding: '5px',
                background: 'rgba(61, 97, 114, 0.5)',
                margin: '20px auto',
                border: '1px solid #55868a'
            },
            overlayFlipped: {
                position: 'absolute',
                whiteSpace: 'nowrap',
                right: '295px',
                top: '-20px',
                padding: '5px',
                background: 'rgba(61, 97, 114, 0.5)',
                margin: '20px auto',
                border: '1px solid #55868a'
            },
            h1: {
                color: 'white',
                fontSize: '14px',
                marginBottom: '10px'
            },
            infoBox: {
                color: 'white',
                fontSize: '15px',
                maxHeight: '80px'
            },
            dataBox: {
                display: 'flex',
                flexWrap: 'nowrap',
                maxHeight: '80px',
                padding: '5px',
                verticalAlign: 'middle'
            },
            h3: {
                paddingTop: '6px',
                fontSize: '14px',
                marginTop: '10px'
            },
            data: {
                verticalAlign: 'center',
                marginLeft: '6px'
            },
            img: {
                width: '32px',
                height: '32px',
                marginRight: '6px',
                verticalAlign: 'middle'
            }
        };
        if (this.props.profile) {
            styles.overlay.position = 'static';
            styles.overlay.top = '0';
            styles.overlay.right = '0';
            styles.overlay.padding = '0';
            styles.overlay.background = 'transparent';
            styles.overlay.border = 'none';
            styles.overlay.margin = '0';
            styles.h1.marginBottom = '0px';
            styles.dataBox.padding = '0px';
        } else {
            styles.overlay.top = '-20px';
            styles.overlay.left = '295px';
        }
        // Simplified sorting logic
        function sortEntriesByValueDesc(obj) {
            var entries = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    entries.push([key, obj[key]]);
                }
            }
            entries.sort(function(a, b) {
                return b[1] - a[1];
            });
            return entries;
        }
        var titleString = '';
        var sortedMasterminds = sortEntriesByValueDesc(data.Masterminds || {});
        var sortedWave1 = sortEntriesByValueDesc(data.Wave1 || {});
        try {
            if (data.String) {
                titleString = data.String;
            }
        } catch (error) {
            titleString = 'Last 10 Games';
            console.error('Error:', error);
        }
        return (
            React.createElement('div', { class: 'loadingSticker', style: this.props.flipped ? styles.overlayFlipped : styles.overlay },
                React.createElement('h1', { style: styles.h1 }, titleString + ' ' + (data.WinLose ? data.WinLose.Wins : '0') + 'W-' + (data.WinLose ? data.WinLose.Losses : '0') + 'L (' + (eloChangeDisplay || 'N/A') + ' Elo)'),
                React.createElement('div', { style: styles.infoBox },
                    React.createElement('div', { style: styles.dataBox },
                        React.createElement('h1', { style: styles.h3 }, 'MMs:'),
                        sortedMasterminds.map(function(entry) {
                            var key = entry[0];
                            var value = entry[1];
                            return React.createElement('div', { key: key, style: styles.data },
                                React.createElement('img', { src: './hud/img/icons/Items/' + key + '.png', style: styles.img }),
                                value
                            );
                        })
                    ),
                    React.createElement('div', { style: styles.dataBox },
                        React.createElement('h1', { style: styles.h3 }, 'Wave 1:'),
                        sortedWave1.map(function(entry) {
                            var key = entry[0];
                            var value = entry[1];
                            return React.createElement('div', { key: key, style: styles.data },
                                React.createElement('img', { src: './hud/img/icons/' + key + '.png', style: styles.img }),
                                value
                            );
                        })
                    )
                )
            )
        );
    }
});

// Attach DrachbotOverlay to the window object to make it globally available
window.DrachbotOverlay = DrachbotOverlay;