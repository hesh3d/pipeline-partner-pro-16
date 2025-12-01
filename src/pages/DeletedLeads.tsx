import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/contexts/I18nContext';
import { Search, Trash2, RotateCcw, Trash, Instagram, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCountries } from '@/hooks/useCountries';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export default function DeletedLeads() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { findCountry } = useCountries();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [restoreDialog, setRestoreDialog] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: deletedLeads, isLoading } = useQuery({
    queryKey: ['deleted-leads', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user?.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filteredLeads = deletedLeads?.filter((lead) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestore = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ deleted_at: null })
        .eq('id', leadId);

      if (error) throw error;

      toast.success('تم استرجاع العميل بنجاح');
      queryClient.invalidateQueries({ queryKey: ['deleted-leads', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['leads', user?.id] });
      setRestoreDialog(null);
    } catch (error) {
      console.error('Error restoring lead:', error);
      toast.error('حدث خطأ أثناء الاسترجاع');
    }
  };

  const handlePermanentDelete = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      toast.success('تم حذف العميل نهائياً');
      queryClient.invalidateQueries({ queryKey: ['deleted-leads', user?.id] });
      setDeleteDialog(null);
    } catch (error) {
      console.error('Error permanently deleting lead:', error);
      toast.error('حدث خطأ أثناء الحذف النهائي');
    }
  };

  const handleEmptyTrash = async () => {
    try {
      if (!deletedLeads || deletedLeads.length === 0) return;

      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('user_id', user?.id)
        .not('deleted_at', 'is', null);

      if (error) throw error;

      toast.success('تم إفراغ سلة المحذوفات');
      queryClient.invalidateQueries({ queryKey: ['deleted-leads', user?.id] });
    } catch (error) {
      console.error('Error emptying trash:', error);
      toast.error('حدث خطأ أثناء إفراغ سلة المحذوفات');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-blur-in">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">
            <Trash2 className="inline h-8 w-8 mr-2 mb-2" />
            سلة المحذوفات
          </h1>
          <p className="text-muted-foreground">
            العملاء المحذوفون مؤقتاً - يمكن استرجاعهم أو حذفهم نهائياً
          </p>
        </div>
        {deletedLeads && deletedLeads.length > 0 && (
          <AlertDialog>
            <Button 
              variant="destructive"
              onClick={handleEmptyTrash}
            >
              <Trash className="h-4 w-4 mr-2" />
              إفراغ سلة المحذوفات
            </Button>
          </AlertDialog>
        )}
      </div>

      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display">العملاء المحذوفون</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">{t('common.loading')}</p>
          ) : !filteredLeads || filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">سلة المحذوفات فارغة</p>
              <p className="text-sm text-muted-foreground">
                لا توجد عملاء محذوفون
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الصورة</TableHead>
                  <TableHead>{t('leads.business')}</TableHead>
                  <TableHead>{t('leads.contact')}</TableHead>
                  <TableHead>{t('leads.rating')}</TableHead>
                  <TableHead>تاريخ الحذف</TableHead>
                  <TableHead>{t('leads.status')}</TableHead>
                  <TableHead>{t('leads.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/50">
                    <TableCell>
                      {lead.image_url ? (
                        <img 
                          src={lead.image_url} 
                          alt={lead.name}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedImage(lead.image_url)}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">No Image</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          {findCountry(lead.country)?.flag} {lead.city}, {findCountry(lead.country)?.name_en}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lead.phone && <p className="text-sm">{lead.phone}</p>}
                        {lead.email && <p className="text-sm text-muted-foreground">{lead.email}</p>}
                        {lead.additional_emails && lead.additional_emails.length > 0 && (
                          <div className="space-y-0.5">
                            {lead.additional_emails.map((email: string, idx: number) => (
                              <p key={idx} className="text-xs text-muted-foreground">{email}</p>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {lead.instagram && Array.isArray(lead.instagram) && lead.instagram.map((account, idx) => (
                            <a 
                              key={`instagram-${idx}`}
                              href={account.startsWith('http') ? account : `https://instagram.com/${account}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title={account}
                            >
                              <Instagram className="h-4 w-4 text-pink-600 hover:text-pink-700 transition-colors" />
                            </a>
                          ))}
                          {lead.facebook && Array.isArray(lead.facebook) && lead.facebook.map((account, idx) => (
                            <a 
                              key={`facebook-${idx}`}
                              href={account.startsWith('http') ? account : `https://facebook.com/${account}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title={account}
                            >
                              <Facebook className="h-4 w-4 text-blue-600 hover:text-blue-700 transition-colors" />
                            </a>
                          ))}
                          {lead.twitter && Array.isArray(lead.twitter) && lead.twitter.map((account, idx) => (
                            <a 
                              key={`twitter-${idx}`}
                              href={account.startsWith('http') ? account : `https://twitter.com/${account}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title={account}
                            >
                              <Twitter className="h-4 w-4 text-sky-500 hover:text-sky-600 transition-colors" />
                            </a>
                          ))}
                          {lead.youtube && Array.isArray(lead.youtube) && lead.youtube.map((account, idx) => (
                            <a 
                              key={`youtube-${idx}`}
                              href={account.startsWith('http') ? account : `https://youtube.com/${account}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title={account}
                            >
                              <Youtube className="h-4 w-4 text-red-600 hover:text-red-700 transition-colors" />
                            </a>
                          ))}
                          {lead.linkedin && Array.isArray(lead.linkedin) && lead.linkedin.map((account, idx) => (
                            <a 
                              key={`linkedin-${idx}`}
                              href={account.startsWith('http') ? account : `https://linkedin.com/in/${account}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title={account}
                            >
                              <Linkedin className="h-4 w-4 text-blue-700 hover:text-blue-800 transition-colors" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">★</span>
                        <span>{lead.rating?.toFixed(1) || 'N/A'}</span>
                        <span className="text-muted-foreground text-sm">({lead.reviews})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {lead.deleted_at ? new Date(lead.deleted_at).toLocaleDateString('ar-SA') : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {lead.has_website && lead.website ? (
                        <Badge variant="secondary">
                          Has Website
                        </Badge>
                      ) : (
                        <Badge variant="default">
                          {t('leads.noWebsite')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRestoreDialog(lead.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          استرجاع
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteDialog(lead.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          حذف نهائي
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!restoreDialog} onOpenChange={() => setRestoreDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>استرجاع العميل</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد استرجاع هذا العميل؟ سيتم نقله إلى قائمة العملاء الرئيسية.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreDialog && handleRestore(restoreDialog)}
            >
              استرجاع
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف نهائي</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد؟ سيتم حذف هذا العميل نهائياً ولا يمكن استرجاعه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && handlePermanentDelete(deleteDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <img 
            src={selectedImage || ''} 
            alt="Full view"
            className="w-full h-auto rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
