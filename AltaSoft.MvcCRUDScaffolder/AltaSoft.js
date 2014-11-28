
var AltaSoft = {};

AltaSoft.CookieNames = {
    ListColumnsConfiguration: 'ListColumns',
    ShowFilters: 'ShowFilters'
}


AltaSoft.General = {

    ConfigureListColumnsVisibility: function (itemsListSelector) {
        this.showHideListColumns(itemsListSelector);
        this.showHideListColumnsClick(itemsListSelector);
    },

    ConfigureListPaging: function (itemsListSelector, filtersFormSelector) {

        $(document).on('click', itemsListSelector + ' .pagination > li > a', function () {
            var skip = $(this).data('skip');
            var url = $(this).parent().parent().data('url');
            var $form = $(filtersFormSelector);

            // თუ ფილტრაციას ვიყენებთ, ფილტრაციის ფორმის გავლით ხდება მონაცემების წამოღება
            if ($form.length) {
                $form.attr('data-skip', skip);
                $form.submit();
                return false;
            }

            AltaSoft.General.loadListData(url, { skip: skip }, itemsListSelector, filtersFormSelector);

            return false;
        });

        $(document).on('click', itemsListSelector + ' tbody tr', function () {
            $(itemsListSelector + ' tr').removeClass('selected-row');
            $(this).addClass('selected-row');
        });
    },

    ConfigureListFilters: function (filtersPanelSelector, itemsListSelector) {

        $(document).on('submit', filtersPanelSelector + ' form', function () {
            var skip = $(this).attr('data-skip') || 0;
            var url = $(this).attr('action');

            $(this).removeAttr('data-skip')

            var data = $(filtersPanelSelector + ' form').serializeArray();
            data.push({
                name: 'skip',
                value: skip
            });

            var postData = {};
            data.forEach(function (item) {
                postData[item.name] = item.value;
            })

            AltaSoft.General.loadListData(url, postData, itemsListSelector, filtersPanelSelector);

            var select = $(filtersPanelSelector + ' .saved-filters');
            $(itemsListSelector).parents('div.form').children().first().find('#ListFilterName').text(select.val() == '0' ? '' : '(Filtered: ' + select.find('option:selected').text() + ')');

            return false;
        });

        $(document).on('click', filtersPanelSelector + ' input[type="button"][data-button-role="clearFilter"]', function () {
            $(filtersPanelSelector + ' .saved-filters').val('0').change();
        });

        $(document).on('click', filtersPanelSelector + ' .save-filter', function () {

            var $filterName = $(filtersPanelSelector + ' #FilterName');

            if ($.trim($filterName.val()) != '') {
                $filterName.removeClass('input-validation-error');
                var id = $(filtersPanelSelector + ' .saved-filters').val();
                var data = $(filtersPanelSelector + ' form input, select, checkbox').filter(function (index, element) {
                    return element.id != '';
                }).serializeArray();
                var postData = {};

                postData['Id'] = id;
                postData['Rowversion'] = $(filtersPanelSelector + ' .saved-filters').find('option:selected').data('rowversion');
                postData['IsCommon'] = $(filtersPanelSelector + ' #CommonLabel').hasClass('active');
                postData['Name'] = $(filtersPanelSelector + ' #FilterName').val();
                postData['Model'] = JSON.stringify(data);
                postData['Path'] = location.pathname;

                AltaSoft.General.saveFilter(postData, filtersPanelSelector);
            }
            else {
                $filterName.parent().effect('shake', { times: 2, distance: 4 }, 'medium', function () {
                    $filterName.addClass('input-validation-error').focus();
                });
            }
        });

        $(document).on('blur', filtersPanelSelector + ' #FilterName', function (e) {
            $(this).removeClass('input-validation-error');
        });

        $(document).on('change', filtersPanelSelector + ' .saved-filters', function () {
            var id = $(this).val();
            var $btn = $(filtersPanelSelector + ' .delete-filter');
            if (id == '0')
                $btn.attr('disabled', 'disabled');
            else
                $btn.removeAttr('disabled');
            AltaSoft.General.loadFilters(id, filtersPanelSelector);
        });

        $(document).on('click', filtersPanelSelector + ' .delete-filter', function () {

            var id = $(filtersPanelSelector + ' .saved-filters').val();

            AltaSoft.General.deleteFilter(id, filtersPanelSelector);
        });

        $(document).on('hidden.bs.collapse', filtersPanelSelector, function () {

            var isVisible = $(filtersPanelSelector).hasClass('in');

            $.cookie(AltaSoft.CookieNames.ShowFilters, isVisible, { expires: 10000, path: location.pathname });
        });

        $(document).on('shown.bs.collapse', filtersPanelSelector, function () {

            var isVisible = $(filtersPanelSelector).hasClass('in');

            $.cookie(AltaSoft.CookieNames.ShowFilters, isVisible, { expires: 10000, path: location.pathname });
        });

        // show / hide filters 
        var showFilters = $.cookie(AltaSoft.CookieNames.ShowFilters);

        if (showFilters == 'true')
            $(filtersPanelSelector).addClass('in');
        else
            $(filtersPanelSelector).removeClass('in');
    },

    ConfigureOperations: function (itemsListSelector, filtersFormSelector) {
        $(document).on('click', '.list-operation, .operation', function () {
            var url = $(this).data('post-url');

            if (itemsListSelector != undefined) {
                if ($('.fa.fa-spinner.fa-spin.list-operation').length != 0)
                    return;

                var skip = $(itemsListSelector + ' .pagination > li.active > a').data('skip');

                if (url != '') {
                    $(this).removeClass().addClass('fa fa-spinner fa-spin list-operation');

                    $.post(url, function () {
                        // თუ ფილტრაციას ვიყენებთ, ფილტრაციის ფორმის გავლით ხდება მონაცემების წამოღება
                        if (filtersFormSelector != undefined) {
                            $(filtersFormSelector).attr('data-skip', skip);
                            $(filtersFormSelector).submit();
                        }
                        else
                            AltaSoft.General.loadListData($(itemsListSelector + ' .pagination').data('url'), { skip: skip }, itemsListSelector, filtersFormSelector);
                    });
                }
            }
            else {
                if ($(this).hasClass('list-operation'))
                    $(this).removeClass().addClass('fa fa-spinner fa-spin list-operation');

                $.post(url, function () {
                    window.location.href = window.location.href; // GET Request
                });
            }
        });
    },

    ConfigureTooltips: function () {
        $(document).tooltip({
            selector: '[data-toggle=tooltip]'
        });
    },

    ConfigureDatePicker: function (options) {

        var defaults = {
            format: 'dd/mm/yyyy',
            autoclose: true,
            todayHighlight: true
        },

        settings = $.extend(defaults, options);

        $(document).on('focus', '.datepicker', function () {
            $(this).datepicker(settings);
        })

        $.validator.addMethod(
            'date',
            function (value, element, params) {
                if (this.optional(element)) {
                    return true;
                };
                var result = false;
                try {
                    $.datepicker.parseDate('dd/mm/yy', value);
                    result = true;
                } catch (err) {
                    result = false;
                }
                return result;
            },
            ''
        );
    },

    ConfigureSearchItem: function (moduleSelector, resultSelector, inputElementSelector, sectionTag, selectedCallback) {
        var $searchForm = $(moduleSelector);
        if ($searchForm != undefined) {
            var $searchBtn = $searchForm.find('input#search');
            var $searchResult = $searchForm.next(resultSelector);

            $searchBtn.on('click', function () {
                var params = $searchForm.find(':input').serializeArray();
                params.push({
                    name: 'skip',
                    value: $(this).attr('skip')
                });

                $.ajax({
                    url: $searchForm.attr('data-load-url'),
                    type: 'POST',
                    data: params,
                    beforeSend: function () {
                        var loading = $('.ajax-load.global').clone(true);
                        $($searchForm.closest('section.search')).append(loading.fadeIn());
                    },
                    success: function (response) {
                        $searchResult.empty();
                        $searchResult.append(response);
                        var $body = $searchResult.find('tbody');

                        $body.find('i[data-button-role="accept"]').on('click', function () {
                            $body.find('tr').removeClass('green');
                            $(this).closest('tr').addClass('green');
                            if (inputElementSelector) {

                                var selectedID = $(this).closest('tr').attr('data-id');
                                $(inputElementSelector).val(selectedID);

                                selectedCallback && selectedCallback(selectedID);

                                $('section.search[data-tag=' + sectionTag + ']').hide();
                            }
                        });
                    },
                    complete: function () {
                        $($searchForm.closest('section.search')).find('.ajax-load.global').remove();
                    }
                });
            });

            $(document).on('click', resultSelector + ' .pagination > li > a', function () {
                $searchBtn.attr('skip', $(this).data('skip'));
                $searchBtn.click();
                $searchBtn.removeAttr('skip');
            });
        }

        $('section.search[data-tag=' + sectionTag + ']').hide();

        $(document).on('focus', inputElementSelector, function () {

            $currentSection = $('section.search[data-tag=' + sectionTag + ']');

            if ($currentSection.is(':visible')) return;

            $('section.search').hide('fast');
            $currentSection.show('fast');
        });
    },

    ConfigureDropDownListCascade: function (changeDropDownSelector, updateDropDownSelector, data) {
        $(changeDropDownSelector).on('change', function () {
            $(updateDropDownSelector).empty();
            $.ajax({
                url: $(changeDropDownSelector).data('update-url'),
                dataType: 'json',
                type: 'GET',
                data: AltaSoft.General.generateJsonData(data),
                success: function (data) {
                    $.each(data, function (i) {
                        var optionhtml = '<option value="' + data[i].Value + '">' + data[i].Text + '</option>';
                        $(updateDropDownSelector).append(optionhtml);
                    });
                },
                error: function () {
                    var $ajaxError = $(document).find('[data-target="AjaxError"]');
                    $ajaxError.find('div').show('fast').html('Cannot load data');
                }
            });
        });
    },

    DeleteItemFromListBindEvent: function (listId) {
        var $table = $(listId);
        var $deleteBtn = $table.find('input[type="button"][name="delete"]');
        $deleteBtn.on('click', function () {
            $(this).closest('tr').remove();
            appendItemToModel(listId);
        });
    },

    AppendItemToModel: function (listId) {
        var $table = $(listId);
        var $tbody = $table.find('tbody');
        var $tfoot = $table.find('tfoot');
        var $values = $tfoot.find('#hiddenValues');

        $values.html('');

        $.each($tbody.find('tr'), function (i, tr) {
            var id = $(tr).find('td > input[type="hidden"]:nth-child(1)').val();
            var adminNumber = $(tr).find('td > input[type="hidden"]:nth-child(2)').val();
            $('<input type="hidden" name="' + listId.replace('#', '') + '[' + i + '].Id">').val(id).appendTo($values);
            $('<input type="hidden" name="' + listId.replace('#', '') + '[' + i + '].AdminNumber">').val(adminNumber).appendTo($values);
        });
    },

    ConfigureListMember: function (listId, flags, states) {

        var errorBlock = function ($div, msg) {
            var html = '<div class="alert-error" role="alert"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><div>' + msg + '</div></div>';
            $div.append(html);
        }

        var $table = $(listId);
        if ($table != undefined) {
            this.AppendItemToModel(listId);
            this.DeleteItemFromListBindEvent(listId);

            var $addBtn = $table.find('input[type="button"]#add');

            $addBtn.on('click', function () {
                var $tbody = $table.find('tbody');
                var $tfoot = $table.find('tfoot');
                var $adminNumber = $tfoot.find('input[type="text"]');

                $tfoot.find('.alert-error').remove();

                if ($adminNumber.val() == '') {
                    $adminNumber.parent().effect('shake', { times: 2, distance: 4 }, 'medium', function () {
                        $adminNumber.addClass('input-validation-error').focus();
                    });
                    return;
                }

                var statesArray = {};
                if (states != undefined)
                    states.forEach(function (state, index) {
                        statesArray[index] = state;
                    })

                $.get($table.data('check-url'), { adminNumber: $adminNumber.val(), flags: flags, states: statesArray }, function (data) {
                    if (data.error != undefined) {
                        errorBlock($tfoot, data.error);
                        return;
                    }


                    if ($tfoot.find('#hiddenValues input[type="hidden"]').filter(function () { return $(this).val() == data.Id }).length > 0) {
                        $adminNumber.val('');
                        return;
                    }

                    $('<tr>')
                        .append($('<td>').text(data.AdminNumber)
                        .append($('<input type="hidden">').val(data.Id))
                        .append($('<input type="hidden">').val(data.AdminNumber)))
                        .append($('<td>').append($('<input type="button" value="Delete" name="delete">')))
                        .appendTo($tbody);

                    AltaSoft.General.AppendItemToModel(listId);
                    AltaSoft.General.DeleteItemFromListBindEvent(listId);

                    $tfoot.find('input[type="text"]').val('');
                });

            });

            $(document).on('blur', listId + ' tfoot input[type="text"]', function (e) {
                $(this).removeClass('input-validation-error');
            });
        }
    },

    // private 
    generateJsonData: function (arr) {
        var data = new Object();
        $.each(arr, function (index, item) {
            data[index] = eval(item);
        });
        return data;
        //return JSON.stringify(data);
    },

    showHideListColumns: function (itemsListSelector) {
        var cookie = $.cookie(AltaSoft.CookieNames.ListColumnsConfiguration);
        if (cookie != null) {
            var columns = $.parseJSON(cookie);
            $.each(columns, function (i, column) {
                var checkbox = $(itemsListSelector + ' thead > tr:first > td > input[type="checkbox"][id="' + column.id + '"]');
                var index = checkbox.parent().index() + 1;
                if (column.show)
                    $(itemsListSelector + ' tr td:nth-child(' + index + ')').show();
                else
                    $(itemsListSelector + ' tr td:nth-child(' + index + ')').hide();
            });
        }
    },

    showHideListColumnsClick: function (itemsListSelector) {
        $(document).on('click', '#ShowHideListColumns', function () {
            if ($(this).data('toggle') == 'odd') {
                if ($.cookie(AltaSoft.CookieNames.ListColumnsConfiguration) == null) {
                    var columns = [];
                    $(itemsListSelector + ' table tr:first td input[type="checkbox"]').each(function () {
                        columns.push({ id: $(this).attr('id'), show: true });
                    });
                    $.cookie(AltaSoft.CookieNames.ListColumnsConfiguration, JSON.stringify(columns), { expires: 10000, path: location.pathname });
                }

                var columns = $.parseJSON($.cookie(AltaSoft.CookieNames.ListColumnsConfiguration));

                $.each(columns, function (i, column) {
                    var checkbox = $(itemsListSelector + ' thead > tr:first > td > input[type="checkbox"][id="' + column.id + '"]');
                    var index = checkbox.parent().index() + 1;
                    if (column.show)
                        $('#' + column.id).prop('checked', true);
                    else
                        $('#' + column.id).prop('checked', false);

                    $(itemsListSelector + ' table tr td:nth-child(' + index + ')').show();
                    $('#' + column.id).show();
                });

                $(this).data('toggle', 'even').attr('data-toggle', 'even');
                $(itemsListSelector + ' table thead tr:first').addClass('column-visibility');
                $(itemsListSelector + ' table tr:first td label').addClass('pointer');
            }
            else {
                var columns = [];
                $(itemsListSelector + ' table tr:first td input[type="checkbox"]').each(function () {
                    columns.push({ id: $(this).attr('id'), show: $(this).is(':checked') });
                    $(this).hide();
                });
                $.cookie(AltaSoft.CookieNames.ListColumnsConfiguration, JSON.stringify(columns), { expires: 10000, path: location.pathname });
                AltaSoft.General.showHideListColumns(itemsListSelector);

                $(this).data('toggle', 'odd').attr('data-toggle', 'odd');
                $(itemsListSelector + ' table thead tr:first').removeClass('column-visibility');
                $(itemsListSelector + ' table tr:first td label').removeClass('pointer');
            }
        });

        $(document).on('click', itemsListSelector + ' table tr:first td label', function (e) {
            var $checkbox = $('#' + $(e.target).attr('for'));
            if (!$checkbox.is(':visible')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
    },

    loadListData: function (url, obj, itemsListSelector, filtersPanelSelector) {

        var loadingAnimationTimeout;

        if (filtersPanelSelector) {
            loadingAnimationTimeout = setTimeout(function () {
                $(filtersPanelSelector + ' button[type=submit]').attr('disabled', 'disabled');
            }, 100);
        }

        $.get(url, obj, function (data) {
            $(itemsListSelector).parent().html(data);

            if (filtersPanelSelector) {
                clearTimeout(loadingAnimationTimeout);
                $(filtersPanelSelector + ' button[type=submit]').removeAttr('disabled');
            }

            AltaSoft.General.showHideListColumns(itemsListSelector);

        }).fail(function (e) {

            if (filtersPanelSelector) {
                $(itemsListSelector).html('');

                var failedLoadPanel = $(filtersPanelSelector).parent().find('.load-failed-panel');
                if (failedLoadPanel.length) {
                    failedLoadPanel.removeClass('hidden');
                    failedLoadPanel.fadeTo(0, 0);
                    failedLoadPanel.fadeTo(500, 1);
                }

                $(filtersPanelSelector + ' button[type=submit]').removeAttr('disabled');
            }
        });
    },

    saveFilter: function (postData, filtersFormSelector) {

        var url = $(filtersFormSelector).data('save-url');

        $.post(url, postData, function (data) {

            if (data == '') {
                $(filtersFormSelector + ' .saved-filters').val(0).change();
                return;
            }

            if (data.error != undefined) {
                $(filtersFormSelector + ' .error-block').append('<div class="alert-error" role="alert" style="height: 34px; padding-right: 20px; padding-top: 0px; padding-bottom: 0px; margin-bottom: 0px"><button type="button" class="close" data-dismiss="alert" style="top: 3px; right: -10px"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><div style="height: 30px; display: table-cell; vertical-align: middle">' + data.error + '</div></div>');
                $(filtersFormSelector + ' .saved-filters').change();
            }

            var $select = $(filtersFormSelector + ' .saved-filters');
            var currentType = $select.find('option[value=' + data.id + ']').parent().attr('label');
            var newtype = postData['IsCommon'] ? 'Common' : 'Individual';

            if ($select.find('optgroup[data-type="' + newtype + '"]').length == 0)
                if (newtype == 'Individual')
                    $select.find('option:first').after('<optgroup label="' + newtype + '" data-type="' + newtype + '"></optgroup>');
                else
                    $select.append('<optgroup label="' + newtype + '" data-type="' + newtype + '"></optgroup>');

            var $optgroup = $select.find('optgroup[data-type="' + newtype + '"]');

            if ($select.find('option[value=' + data.id + ']').length == 0)
                $optgroup.append($('<option></option>').attr('value', data.id));
            else if (newtype != currentType) {
                $optgroup.append($select.find('option[value=' + data.id + ']'));
            }

            $select.find('option[value=' + data.id + ']').text(postData['Name']).data('rowversion', data.rowVersion).attr('data-rowversion', data.rowVersion);
            $(filtersFormSelector + ' .delete-filter').removeAttr('disabled');
            $(filtersFormSelector + ' .saved-filters').val(data.id);
        });
    },

    loadFilters: function (id, filtersFormSelector) {

        var url = $(filtersFormSelector).data('load-url');
        if (id != '0') {
            $.get(url, { ID: id }, function (data) {
                var filter = data;
                var model = $.parseJSON(filter.Model);

                $(filtersFormSelector + ' #FilterName').val(filter.Name);

                if (filter.IsCommon) {
                    $(filtersFormSelector + ' #IndividualLabel').removeClass('active');
                    $(filtersFormSelector + ' #CommonLabel').addClass('active');
                }
                else {
                    $(filtersFormSelector + ' #IndividualLabel').addClass('active');
                    $(filtersFormSelector + ' #CommonLabel').removeClass('active');
                }

                $.each(model, function (index, property) {
                    $(filtersFormSelector + ' form #' + property.name).val(property.value);
                });
            });
        }
        else {
            $(filtersFormSelector + ' #FilterName').val('');
            $(filtersFormSelector + ' #IndividualLabel').addClass('active');
            $(filtersFormSelector + ' #CommonLabel').removeClass('active');
            $(filtersFormSelector + ' form')[0].reset();
        }
    },

    deleteFilter: function (id, filtersFormSelector) {

        var url = $(filtersFormSelector).data('delete-url');

        $.post(url, { ID: id }, function (data) {
            var $option = $(filtersFormSelector + ' .saved-filters option[value=' + id + ']');

            if ($option.parent().children().length == 1)
                $option.parent().remove();
            else
                $option.remove();

            $(filtersFormSelector + ' #FilterName').val('');
            $(filtersFormSelector + ' #IndividualLabel').addClass('active');
            $(filtersFormSelector + ' #CommonLabel').removeClass('active');
            $(filtersFormSelector + ' .delete-filter').attr('disabled', 'disabled');
            $(filtersFormSelector + ' form')[0].reset();
        });
    },
}