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
        var data = this.state.data;
        var loading = this.state.loading;
        var error = this.state.error;

        if (loading) {
            return React.createElement('div', { style: {top: '-10px', position: 'absolute'} }, 'Loading...');
        }

        if (error) {
            return React.createElement('div', { style: {top: '-10px', position: 'absolute'} }, 'Error: (' + this.props.playername + ')');
        }

        if (!data) {
            return React.createElement('div', { style: {top: '-10px', position: 'absolute'} }, 'No data available.');
        }

        var eloChange = data.EloChange;
        var eloChangeDisplay = (eloChange > 0 ? '+' : '') + eloChange;
        if (Object.keys(data.Masterminds).length > 4) {
            var pixelOffset = '-360px';
        } else {
            var pixelOffset = '-260px';
        }
        var styles = {
            overlay: {
                position: 'absolute',
                whiteSpace: 'nowrap',
                right: this.props.profile ? '20px' : pixelOffset,
                top: this.props.profile ? '40px' : '-20px',
                width: 'max-content',
                padding: '5px',
                maxHeight: '128px',
                background: 'rgba(61, 97, 114, 0.5)',
                margin: '20px auto',
                border: '1px solid #55868a'
            },
            overlayFlipped: {
                position: 'absolute',
                whiteSpace: 'nowrap',
                right: '310px',
                top: '-20px',
                width: 'max-content',
                padding: '10px',
                maxHeight: '128px',
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
                fontSize: '14px',
                maxHeight: '80px'
            },
            dataBox: {
                display: 'flex',
                flexWrap: 'nowrap',
                maxHeight: '80px',
                verticalAlign: 'middle'
            },
            h3: {
                paddingTop: '6px',
                fontSize: '14px',
                marginTop: '10px'
            },
            data: {
                verticalAlign: 'center',
                marginLeft: '5px'
            },
            img: {
                width: '32px',
                height: '32px',
                marginRight: '5px',
                verticalAlign: 'middle'
            }
        };

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

        var sortedMasterminds = sortEntriesByValueDesc(data.Masterminds || {});
        var sortedWave1 = sortEntriesByValueDesc(data.Wave1 || {});

        return (
            React.createElement('div', { style: this.props.flipped ? styles.overlayFlipped : styles.overlay },
                React.createElement('h1', { style: styles.h1 }, 'Last 10 Games ' + (data.WinLose ? data.WinLose.Wins : '0') + 'W-' + (data.WinLose ? data.WinLose.Losses : '0') + 'L (' + (eloChangeDisplay || 'N/A') + ' Elo)'),
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