(function() {

    var content = '';

    [
        { name: 'Item', value: 'Value' },
        { name: 'Device Name', value: window.device.name },
        { name: 'Device UUID', value: window.device.uuid },
        { name: 'Platform Name', value: window.device.platform },
        { name: 'Platform Version', value: window.device.version },
        { name: 'PhoneGap Version', value: window.device.phonegap }
    ].forEach(function(obj) {
       content += '<li>' + obj.name +
                    '<p class="ui-li-aside ul-li-desc">' + obj.value + '</p>' +
                  '</li>';
    });

    if ( $('#device ul[data-role="listview"]').html(content).hasClass('ui-listview')) {
        $('#device ul[data-role="listview"]').html(content).listview('refresh');
    } 
    else {
        $('#device ul[data-role="listview"]').html(content).trigger('create');
    }
    //$('#device ul[data-role="listview"]').html(content).listview('refresh');
})();
