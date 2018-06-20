import {
    AfterViewInit,
    Component,
    EventEmitter,
    OnInit,
    Output,
    Input
} from '@angular/core';

import {
    ImportsService,
    SaveParams
} from '../../resources/imports/imports.service';

import { Import }                  from '../../resources/imports/import';
import { ImportLatest }            from '../../resources/imports/import-latest';
import { ImportState }             from '../../enums/import-state.enum';

import { RepositoryImportService } from '../../resources/repository-imports/repository-import.service';
import { RepositoryImport }        from '../../resources/repository-imports/repository-import';

import { AuthService }             from '../../auth/auth.service';

import * as $       from 'jquery';
import * as lodash  from 'lodash';


@Component({
  selector: 'app-import-detail',
  templateUrl: './import-detail.component.html',
  styleUrls: ['./import-detail.component.less']
})
export class ImportDetailComponent implements OnInit, AfterViewInit {

    private _importTask: Import;
    private _refreshing: boolean;
    private canImport: boolean;

    scroll = false;

    ImportState: typeof ImportState = ImportState;

    @Input()
    set importTask(data: Import) {
        this.canImport = false;

        if (data) {
            this.authService.me().subscribe(
                (me) => {
                    this.canImport = me.username === data.summary_fields.owner.username;
                }
            );
        }

        if (this._importTask && this.importTask.id !== data.id) {
            this.scroll = false;
            this.scrollToggled.emit(this.scroll);
        }
        this._importTask = data;
        setTimeout(_ => {
            this.affix();
        }, 1000);
    }

    get importTask(): Import {
        return this._importTask;
    }

    @Input()
    set refreshing(data: boolean) {
        this._refreshing = data;
    }

    get refreshing(): boolean {
        return this._refreshing;
    }

    @Output() startedImport = new EventEmitter<boolean>();
    @Output() scrollToggled = new EventEmitter<boolean>();

    constructor(
        private repositoryImportService: RepositoryImportService,
        private authService: AuthService
    ) {}

    ngOnInit() {}

    ngAfterViewInit() {}

    startImport(): void {
        this.repositoryImportService.save({'repository_id': this.importTask.summary_fields.repository.id})
            .subscribe(response => {
                console.log(
                  `Started import for repository ${this.importTask.summary_fields.repository.id}`
                );
                this.startedImport.emit(true);
            });
    }

    affix(): void {
        const $cache = $('#log-follow-button');
        const $idcontainer = $('#import-details-container');
        $($idcontainer).scroll(_ => {
            const y = $($idcontainer).scrollTop();
            if (y > 165) {
                $cache.addClass('fixed');
            } else {
                $cache.removeClass('fixed');
            }
        });
    }

    toggleScroll() {
        this.scroll = !this.scroll;
        this.scrollToggled.emit(this.scroll);
    }
}
